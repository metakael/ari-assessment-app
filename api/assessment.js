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
                history: [] // Initialize history
            };
            const firstQuestionId = sessionData.phase1Ids.shift();
            sessionData.lastQuestionId = firstQuestionId; // Track first question ID
            const firstQuestion = questionBank.phase1.find(q => q.id === firstQuestionId);
            await kv.set(newSessionId, sessionData);
            return response.status(200).json({ sessionId: newSessionId, question: { ...firstQuestion, options: firstQuestion.options.sort(() => 0.5 - Math.random()) }, questionNumber: 1 });
        }

        if (action === 'goBack') {
            let sessionData = await kv.get(sessionId);
            if (!sessionData || !sessionData.history || sessionData.history.length === 0) {
                return response.status(400).json({ error: "No history to revert to." });
            }
            
            // Pop the previous state from history
            const previousState = sessionData.history.pop();
            
            // Reconstruct the full session object from the previous state
            const restoredSessionData = {
                ...sessionData, // a good base
                ...previousState, // overwrite with historical data
                history: sessionData.history // ensure we use the now-shortened history
            };

            await kv.set(sessionId, restoredSessionData);
            
            let previousQuestion;
            if (restoredSessionData.phase === 1) {
                previousQuestion = questionBank.phase1.find(q => q.id === restoredSessionData.lastQuestionId);
            } else if (restoredSessionData.phase === 2) {
                 const [top, second, third] = Object.entries(restoredSessionData.scores).sort((a,b) => b[1]-a[1]).map(s => s[0]);
                 const scenario = questionBank.phase2.find(q => q.id === restoredSessionData.lastQuestionId);
                 previousQuestion = { scenario: scenario.scenario, options: [scenario.options.find(o => o.domain === top), scenario.options.find(o => o.domain === second), scenario.options.find(o => o.domain === third)]};
            } else { // Phase 3
                 const scenario = questionBank.phase3.find(q => q.id === restoredSessionData.lastQuestionId);
                 previousQuestion = { scenario: scenario.scenario, options: scenario.optionsByDomain[restoredSessionData.primaryDomain] };
            }

            return response.status(200).json({ 
                status: restoredSessionData.phase === 3 ? 'archetypeQuestion' : 'nextQuestion',
                question: { ...previousQuestion, options: previousQuestion.options.sort(() => 0.5 - Math.random()) }, 
                questionNumber: restoredSessionData.questionNumber,
                primaryDomain: restoredSessionData.phase === 3 ? questionBank.domains[restoredSessionData.primaryDomain] : null
            });
        }

        if (action === 'submitAnswer') {
            let sessionData = await kv.get(sessionId);
            if (!sessionData) return response.status(404).json({ error: "Session not found." });

            // UPDATED: Create a lean snapshot for history, preventing bloat.
            const historyState = {
                scores: JSON.parse(JSON.stringify(sessionData.scores)),
                archetypeScores: JSON.parse(JSON.stringify(sessionData.archetypeScores)),
                questionNumber: sessionData.questionNumber,
                phase: sessionData.phase,
                phase1Ids: [...sessionData.phase1Ids],
                phase2Ids: [...sessionData.phase2Ids],
                lastQuestionId: sessionData.lastQuestionId
            };
            if (!sessionData.history) sessionData.history = [];
            sessionData.history.push(historyState);

            const { answers } = payload;
            for (const domain in answers) {
                sessionData.scores[domain] += answers[domain];
            }
            sessionData.questionNumber++;
            
            let nextQuestion;
            if (sessionData.phase1Ids.length > 0) {
                const nextQId = sessionData.phase1Ids.shift();
                sessionData.lastQuestionId = nextQId;
                nextQuestion = questionBank.phase1.find(q => q.id === nextQId);
            } else if (sessionData.phase2Ids.length > 0) {
                sessionData.phase = 2;
                const sortedScores = Object.entries(sessionData.scores).sort((a, b) => b[1] - a[1]);
                const [top, second, third] = sortedScores.map(s => s[0]);
                const nextScenarioId = sessionData.phase2Ids.shift();
                sessionData.lastQuestionId = nextScenarioId;
                const nextScenarioData = questionBank.phase2.find(q => q.id === nextScenarioId);
                nextQuestion = { scenario: nextScenarioData.scenario, options: [nextScenarioData.options.find(o => o.domain === top), nextScenarioData.options.find(o => o.domain === second), nextScenarioData.options.find(o => o.domain === third)] };
            } else {
                const sortedScores = Object.entries(sessionData.scores).sort((a, b) => b[1] - a[1]);
                sessionData.primaryDomain = sortedScores[0][0];
                await kv.set(sessionId, sessionData);
                return response.status(200).json({ 
                    status: 'startArchetypePhase', 
                    primaryDomain: questionBank.domains[sessionData.primaryDomain],
                    questionNumber: sessionData.questionNumber
                });
            }

            await kv.set(sessionId, sessionData);
            return response.status(200).json({ status: 'nextQuestion', question: { ...nextQuestion, options: nextQuestion.options.sort(() => 0.5 - Math.random()) }, questionNumber: sessionData.questionNumber });
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
            sessionData.lastQuestionId = nextQId;
            const nextQData = questionBank.phase3.find(q => q.id === nextQId);
            const firstPhase3Question = { scenario: nextQData.scenario, options: nextQData.optionsByDomain[primaryDomain] };
            
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
            
            const historyState = {
                scores: JSON.parse(JSON.stringify(sessionData.scores)),
                archetypeScores: JSON.parse(JSON.stringify(sessionData.archetypeScores)),
                questionNumber: sessionData.questionNumber,
                phase: sessionData.phase,
                phase3Ids: sessionData.phase3Ids ? [...sessionData.phase3Ids] : undefined,
                lastQuestionId: sessionData.lastQuestionId
            };
            if (!sessionData.history) sessionData.history = [];
            sessionData.history.push(historyState);

            const { rankedArchetypes } = payload;
            const numArchetypes = rankedArchetypes.length;
            rankedArchetypes.forEach((archetype, index) => {
                const points = numArchetypes - index;
                sessionData.archetypeScores[archetype] += points;
            });
            sessionData.questionNumber++;

            if (sessionData.phase3Ids.length > 0) {
                const nextQId = sessionData.phase3Ids.shift();
                sessionData.lastQuestionId = nextQId;
                const nextQData = questionBank.phase3.find(q => q.id === nextQId);
                const nextQ = { scenario: nextQData.scenario, options: nextQData.optionsByDomain[sessionData.primaryDomain] };
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
