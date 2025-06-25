// api/assessment.js
import { kv } from '@vercel/kv';

// This is the serverless function handler.
export default async function handler(request, response) {
    try {
        // UPDATED: Access the request body directly. This is the fix.
        const { action, sessionId, payload } = request.body;
        
        const questionBank = await kv.get('ari-question-bank');

        // ACTION: 'start' - Initializes a new test session.
        if (action === 'start') {
            const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const sessionData = {
                scores: { praxis: 0, cognito: 0, nexus: 0, kosmos: 0, genesis: 0 },
                archetypeScores: {},
                questionNumber: 1,
                phase: 1,
                // Get Phase 1 question IDs in a fixed, sequential order.
                phase1Ids: questionBank.phase1.map(q => q.id),
                // Get Phase 2 question IDs and shuffle them for variety.
                phase2Ids: questionBank.phase2.map(q => q.id).sort(() => 0.5 - Math.random()),
            };

            const firstQuestionId = sessionData.phase1Ids.shift();
            const firstQuestion = questionBank.phase1.find(q => q.id === firstQuestionId);
            await kv.set(newSessionId, sessionData);

            return response.status(200).json({ 
                sessionId: newSessionId, 
                question: { ...firstQuestion, options: firstQuestion.options.sort(() => 0.5 - Math.random()) },
                questionNumber: sessionData.questionNumber,
                totalQuestions: 20
            });
        }

        // ACTION: 'submitAnswer' - Processes a user's answer for Phase 1 or 2.
        if (action === 'submitAnswer') {
            let sessionData = await kv.get(sessionId);
            if (!sessionData) return response.status(404).json({ error: "Session not found." });

            const { answers } = payload;
            for (const domain in answers) {
                sessionData.scores[domain] = (sessionData.scores[domain] || 0) + answers[domain];
            }
            sessionData.questionNumber++;

            if (sessionData.questionNumber > 20) {
                const sortedScores = Object.entries(sessionData.scores).sort((a, b) => b[1] - a[1]);
                sessionData.primaryDomain = sortedScores[0][0];
                sessionData.secondaryDomain = sortedScores[1][0];
                await kv.set(sessionId, sessionData);
                return response.status(200).json({ 
                    status: 'domainResults', 
                    primaryDomain: sessionData.primaryDomain, 
                    secondaryDomain: sessionData.secondaryDomain 
                });
            }
            
            let nextQuestion;
            if (sessionData.questionNumber <= 10) {
                const nextQId = sessionData.phase1Ids.shift();
                nextQuestion = questionBank.phase1.find(q => q.id === nextQId);
            } else {
                sessionData.phase = 2;
                const sortedScores = Object.entries(sessionData.scores).sort((a, b) => b[1] - a[1]);
                const topDomain = sortedScores[0][0];
                const secondDomain = sortedScores[1][0];
                const thirdDomain = sortedScores[2][0];
                
                const nextScenarioData = questionBank.phase2.find(q => q.id === sessionData.phase2Ids.shift());
                const option1 = nextScenarioData.options.find(opt => opt.domain === topDomain);
                const option2 = nextScenarioData.options.find(opt => opt.domain === secondDomain);
                const option3 = nextScenarioData.options.find(opt => opt.domain === thirdDomain);
                
                nextQuestion = { 
                    scenario: nextScenarioData.scenario, 
                    options: [option1, option2, option3]
                };
            }

            nextQuestion.options = nextQuestion.options.sort(() => 0.5 - Math.random());
            await kv.set(sessionId, sessionData);

            return response.status(200).json({
                status: 'nextQuestion',
                question: nextQuestion,
                questionNumber: sessionData.questionNumber
            });
        }

        // ACTION: 'startArchetypeTest' - Begins Phase 3.
        if (action === 'startArchetypeTest') {
            let sessionData = await kv.get(sessionId);
            const primaryDomain = sessionData.primaryDomain;
            sessionData.phase = 3;
            sessionData.phase3Ids = questionBank.phase3[primaryDomain].map(q => q.id); 
            const nextQId = sessionData.phase3Ids.shift();
            const nextQ = questionBank.phase3[primaryDomain].find(q => q.id === nextQId);
            
            await kv.set(sessionId, sessionData);
            return response.status(200).json({ 
                status: 'archetypeQuestion', 
                question: { ...nextQ, options: nextQ.options.sort(() => 0.5 - Math.random()) }
            });
        }

        // ACTION: 'submitArchetypeAnswer' - Processes a Phase 3 answer.
        if (action === 'submitArchetypeAnswer') {
            let sessionData = await kv.get(sessionId);
            const { answers } = payload;
            for (const archetype in answers) {
                sessionData.archetypeScores[archetype] = (sessionData.archetypeScores[archetype] || 0) + answers[archetype];
            }

            if (sessionData.phase3Ids.length > 0) {
                const nextQId = sessionData.phase3Ids.shift();
                const nextQ = questionBank.phase3[sessionData.primaryDomain].find(q => q.id === nextQId);
                await kv.set(sessionId, sessionData);
                return response.status(200).json({ 
                    status: 'archetypeQuestion', 
                    question: { ...nextQ, options: nextQ.options.sort(() => 0.5 - Math.random()) }
                });
            } else {
                const sortedArchetypes = Object.entries(sessionData.archetypeScores).sort((a,b) => b[1] - a[1]);
                const finalArchetype = sortedArchetypes[0][0];
                sessionData.finalArchetype = finalArchetype;
                await kv.set(sessionId, sessionData);
                return response.status(200).json({ status: 'finalResults', finalArchetype: finalArchetype });
            }
        }
        
        return response.status(400).json({ error: "Invalid action." });

    } catch (error) {
        console.error("API Error:", error);
        return response.status(500).json({ error: 'An internal error occurred.' });
    }
}