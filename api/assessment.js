// api/assessment.js
import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    try {
        const { action, sessionId, payload } = request.body;
        const questionBank = await kv.get('ari-v2-question-bank');
        if (!questionBank) {
            return response.status(500).json({ error: "Question bank not found in database." });
        }

        if (action === 'start') {
            const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const sessionData = {
                scores: { mentis: 0, imperii: 0, operis: 0, foederis: 0 },
                archetypeScores: {},
                questionNumber: 1,
                phase: 1,
                phase1Ids: questionBank.phase1.map(q => q.id),
                phase2Ids: questionBank.phase2.map(q => q.id).sort(() => 0.5 - Math.random()),
            };

            const firstQuestionId = sessionData.phase1Ids.shift();
            const firstQuestion = questionBank.phase1.find(q => q.id === firstQuestionId);
            await kv.set(newSessionId, sessionData);

            return response.status(200).json({ 
                sessionId: newSessionId, 
                question: { ...firstQuestion, options: firstQuestion.options.sort(() => 0.5 - Math.random()) },
                questionNumber: sessionData.questionNumber,
                totalQuestions: 18
            });
        }

        if (action === 'submitAnswer') {
            let sessionData = await kv.get(sessionId);
            if (!sessionData) return response.status(404).json({ error: "Session not found." });

            const { answers } = payload;
            for (const domain in answers) {
                sessionData.scores[domain] = (sessionData.scores[domain] || 0) + answers[domain];
            }
            sessionData.questionNumber++;

            if (sessionData.questionNumber > 18) {
                const sortedScores = Object.entries(sessionData.scores).sort((a, b) => b[1] - a[1]);
                sessionData.primaryDomain = sortedScores[0][0];
                await kv.set(sessionId, sessionData);
                return response.status(200).json({ 
                    status: 'domainResults', 
                    primaryDomain: sessionData.primaryDomain
                });
            }
            
            let nextQuestion;
            if (sessionData.questionNumber <= 8) {
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

        if (action === 'startArchetypeTest') {
            let sessionData = await kv.get(sessionId);
            const primaryDomain = sessionData.primaryDomain;
            sessionData.phase = 3;
            // UPDATED: Get IDs from the new phase3 array
            sessionData.phase3Ids = questionBank.phase3.map(q => q.id);
            const archetypes = Object.keys(questionBank.archetypes[primaryDomain]);
            archetypes.forEach(arch => { sessionData.archetypeScores[arch] = 0; });
            
            const nextQId = sessionData.phase3Ids.shift();
            const nextQData = questionBank.phase3.find(q => q.id === nextQId);
            // UPDATED: Construct the question with the correct options for the user's domain
            const nextQ = {
                scenario: nextQData.scenario,
                options: nextQData.optionsByDomain[primaryDomain]
            };
            
            await kv.set(sessionId, sessionData);
            return response.status(200).json({ 
                status: 'archetypeQuestion', 
                question: { ...nextQ, options: nextQ.options.sort(() => 0.5 - Math.random()) }
            });
        }

        if (action === 'submitArchetypeRanking') {
            let sessionData = await kv.get(sessionId);
            const { rankedArchetypes } = payload;
            
            const numArchetypes = rankedArchetypes.length;
            rankedArchetypes.forEach((archetype, index) => {
                const points = numArchetypes - index;
                sessionData.archetypeScores[archetype] = (sessionData.archetypeScores[archetype] || 0) + points;
            });

            if (sessionData.phase3Ids.length > 0) {
                const nextQId = sessionData.phase3Ids.shift();
                // UPDATED: Logic to fetch next question from the new structure
                const nextQData = questionBank.phase3.find(q => q.id === nextQId);
                const nextQ = {
                    scenario: nextQData.scenario,
                    options: nextQData.optionsByDomain[sessionData.primaryDomain]
                };
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