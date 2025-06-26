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
            return response.status(200).json({ sessionId: newSessionId, question: { ...firstQuestion, options: firstQuestion.options.sort(() => 0.5 - Math.random()) }, questionNumber: 1 });
        }

        if (action === 'submitAnswer') {
            let sessionData = await kv.get(sessionId);
            if (!sessionData) return response.status(404).json({ error: "Session not found." });

            const { answers } = payload;
            for (const domain in answers) {
                sessionData.scores[domain] += answers[domain];
            }
            sessionData.questionNumber++;
            
            let nextQuestion;
            if (sessionData.phase1Ids.length > 0) {
                // Still in Phase 1
                const nextQId = sessionData.phase1Ids.shift();
                nextQuestion = questionBank.phase1.find(q => q.id === nextQId);
            } else if (sessionData.phase2Ids.length > 0) {
                // In Phase 2
                sessionData.phase = 2;
                const sortedScores = Object.entries(sessionData.scores).sort((a, b) => b[1] - a[1]);
                const [top, second, third] = sortedScores.map(s => s[0]);
                const nextScenarioData = questionBank.phase2.find(q => q.id === sessionData.phase2Ids.shift());
                nextQuestion = { 
                    scenario: nextScenarioData.scenario, 
                    options: [
                        nextScenarioData.options.find(o => o.domain === top),
                        nextScenarioData.options.find(o => o.domain === second),
                        nextScenarioData.options.find(o => o.domain === third)
                    ]
                };
            } else {
                // Phase 2 is complete, show domain results
                const sortedScores = Object.entries(sessionData.scores).sort((a, b) => b[1] - a[1]);
                sessionData.primaryDomain = sortedScores[0][0];
                await kv.set(sessionId, sessionData);
                return response.status(200).json({ 
                    status: 'domainResults', 
                    primaryDomain: sessionData.primaryDomain
                });
            }

            await kv.set(sessionId, sessionData);
            return response.status(200).json({
                status: 'nextQuestion',
                question: { ...nextQuestion, options: nextQuestion.options.sort(() => 0.5 - Math.random()) },
                questionNumber: sessionData.questionNumber
            });
        }

        if (action === 'startArchetypeTest') {
            let sessionData = await kv.get(sessionId);
            const primaryDomain = sessionData.primaryDomain;
            sessionData.phase = 3;
            sessionData.phase3Ids = questionBank.phase3.map(q => q.id);
            sessionData.archetypeScores = {};
            const archetypes = Object.keys(questionBank.archetypes[primaryDomain]);
            archetypes.forEach(arch => { sessionData.archetypeScores[arch] = 0; });
            const nextQId = sessionData.phase3Ids.shift();
            const nextQData = questionBank.phase3.find(q => q.id === nextQId);
            const firstPhase3Question = {
                scenario: nextQData.scenario,
                options: nextQData.optionsByDomain[primaryDomain]
            };
            await kv.set(sessionId, sessionData);
            return response.status(200).json({ 
                status: 'archetypeQuestion', 
                question: { ...firstPhase3Question, options: firstPhase3Question.options.sort(() => 0.5 - Math.random()) },
                primaryDomain: questionBank.domains[primaryDomain],
                questionNumber: sessionData.questionNumber
            });
        }

        if (action === 'submitArchetypeRanking') {
            let sessionData = await kv.get(sessionId);
            const { rankedArchetypes } = payload;
            const numArchetypes = rankedArchetypes.length;
            rankedArchetypes.forEach((archetype, index) => {
                const points = numArchetypes - index;
                sessionData.archetypeScores[archetype] += points;
            });
            sessionData.questionNumber++;

            if (sessionData.phase3Ids.length > 0) {
                const nextQId = sessionData.phase3Ids.shift();
                const nextQData = questionBank.phase3.find(q => q.id === nextQId);
                const nextQ = {
                    scenario: nextQData.scenario,
                    options: nextQData.optionsByDomain[sessionData.primaryDomain]
                };
                await kv.set(sessionId, sessionData);
                return response.status(200).json({ 
                    status: 'archetypeQuestion', 
                    question: { ...nextQ, options: nextQ.options.sort(() => 0.5 - Math.random()) },
                    primaryDomain: questionBank.domains[sessionData.primaryDomain],
                    questionNumber: sessionData.questionNumber
                });
            } else {
                const sortedArchetypes = Object.entries(sessionData.archetypeScores).sort((a,b) => b[1] - a[1]);
                const finalArchetypeKey = sortedArchetypes[0][0];
                const finalProfile = questionBank.profiles[finalArchetypeKey];
                return response.status(200).json({ 
                    status: 'finalResults', 
                    primaryDomain: questionBank.domains[sessionData.primaryDomain],
                    finalArchetype: finalArchetypeKey,
                    profileData: { ...finalProfile, domainDescription: questionBank.domains[sessionData.primaryDomain].description }
                });
            }
        }
        
        return response.status(400).json({ error: "Invalid action." });
    } catch (error) {
        console.error("API Error:", error);
        return response.status(500).json({ error: 'An internal error occurred.' });
    }
}