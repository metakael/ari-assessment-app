// api/assessment.js
import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    // Add comprehensive logging
    console.log('=== API CALL START ===');
    console.log('Method:', request.method);
    console.log('Request body:', JSON.stringify(request.body, null, 2));
    
    try {
        const { action, sessionId, payload } = request.body;
        
        console.log('Action:', action);
        console.log('Session ID:', sessionId);
        
        const questionBank = await kv.get('ari-v2-question-bank');
        if (!questionBank) {
            console.error('Question bank not found in KV storage');
            return response.status(500).json({ error: "Question bank not found in database." });
        }
        
        console.log('Question bank loaded successfully');
        console.log('Phase1 questions:', questionBank.phase1.length);
        console.log('Phase2 questions:', questionBank.phase2.length);
        console.log('Phase3 questions:', questionBank.phase3.length);

        if (action === 'start') {
            const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const sessionData = {
                scores: { mentis: 0, imperii: 0, operis: 0, foederis: 0 },
                archetypeScores: {},
                questionNumber: 1,
                phase: 1,
                // ✅ NEW: Randomize question order within each phase
                phase1Ids: questionBank.phase1.map(q => q.id).sort(() => 0.5 - Math.random()),
                phase2Ids: questionBank.phase2.map(q => q.id).sort(() => 0.5 - Math.random()),
                phase3Ids: questionBank.phase3.map(q => q.id).sort(() => 0.5 - Math.random()),
                history: [] 
            };
            const firstQuestionId = sessionData.phase1Ids[0];
            sessionData.lastQuestionId = firstQuestionId;
            const firstQuestion = questionBank.phase1.find(q => q.id === firstQuestionId);
            
            console.log('✅ Questions randomized:');
            console.log('Phase 1 order:', sessionData.phase1Ids);
            console.log('Phase 2 order:', sessionData.phase2Ids);
            console.log('Phase 3 order:', sessionData.phase3Ids);
            
            await kv.set(newSessionId, sessionData);
            return response.status(200).json({ 
                sessionId: newSessionId, 
                question: { ...firstQuestion, options: firstQuestion.options.sort(() => 0.5 - Math.random()) }, 
                questionNumber: 1 
            });
        }

        if (action === 'goBack') {
            let sessionData = await kv.get(sessionId);
            if (!sessionData || !sessionData.history || sessionData.history.length === 0) {
                return response.status(400).json({ error: "No history to revert to." });
            }
            
            const previousState = sessionData.history.pop();
            
            const restoredSessionData = {
                ...sessionData,
                ...previousState,
                history: sessionData.history
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
            console.log('=== SUBMIT ANSWER START ===');
            
            let sessionData = await kv.get(sessionId);
            if (!sessionData) {
                console.error('Session not found:', sessionId);
                return response.status(404).json({ error: "Session not found." });
            }
            
            console.log('Current session data:');
            console.log('- Question number:', sessionData.questionNumber);
            console.log('- Phase:', sessionData.phase);
            console.log('- Current scores:', sessionData.scores);
            console.log('- Phase1 IDs remaining:', sessionData.phase1Ids.length);
            console.log('- Phase2 IDs remaining:', sessionData.phase2Ids.length);

            // Save history
            const historyState = {
                scores: JSON.parse(JSON.stringify(sessionData.scores)),
                archetypeScores: JSON.parse(JSON.stringify(sessionData.archetypeScores)),
                questionNumber: sessionData.questionNumber,
                phase: sessionData.phase,
                phase1Ids: [...sessionData.phase1Ids],
                phase2Ids: [...sessionData.phase2Ids],
                phase3Ids: sessionData.phase3Ids ? [...sessionData.phase3Ids] : undefined,
                lastQuestionId: sessionData.lastQuestionId
            };
            if (!sessionData.history) sessionData.history = [];
            sessionData.history.push(historyState);

            // Update scores
            const { answers } = payload;
            console.log('Answers received:', answers);
            
            for (const domain in answers) {
                sessionData.scores[domain] += answers[domain];
            }
            
            console.log('Updated scores:', sessionData.scores);
            
            let nextQuestion;
            
            // DETAILED PHASE LOGIC WITH LOGGING
            console.log('=== PHASE DETERMINATION ===');
            console.log('Current question number:', sessionData.questionNumber);
            
            if (sessionData.questionNumber < 8) {
                console.log('PHASE 1: Moving to next Phase 1 question');
                sessionData.questionNumber++;
                console.log('New question number:', sessionData.questionNumber);
                
                const nextQId = sessionData.phase1Ids[sessionData.questionNumber - 1];
                console.log('Next question ID:', nextQId);
                console.log('Phase1 IDs array:', sessionData.phase1Ids);
                
                if (!nextQId) {
                    console.error('No next question ID found at index:', sessionData.questionNumber - 1);
                    return response.status(500).json({ error: "Phase 1 question not found." });
                }
                
                sessionData.lastQuestionId = nextQId;
                nextQuestion = questionBank.phase1.find(q => q.id === nextQId);
                
                if (!nextQuestion) {
                    console.error('No question found for ID:', nextQId);
                    return response.status(500).json({ error: "Phase 1 question data not found." });
                }
                
                console.log('Phase 1 question found:', nextQuestion.scenario.substring(0, 50) + '...');

            } else if (sessionData.questionNumber < 18) {
                console.log('PHASE 2: Moving to next Phase 2 question');
                sessionData.questionNumber++;
                sessionData.phase = 2;
                console.log('New question number:', sessionData.questionNumber);
                
                const sortedScores = Object.entries(sessionData.scores).sort((a, b) => b[1] - a[1]);
                console.log('Sorted scores:', sortedScores);
                
                const [top, second, third] = sortedScores.map(s => s[0]);
                console.log('Top 3 domains:', { top, second, third });
                
                // Calculate phase 2 index
                const phase2Index = sessionData.questionNumber - 9;
                console.log('Phase 2 index:', phase2Index);
                console.log('Phase2 IDs array:', sessionData.phase2Ids);
                console.log('Phase2 IDs length:', sessionData.phase2Ids.length);
                
                if (phase2Index >= sessionData.phase2Ids.length) {
                    console.error('Phase 2 index out of bounds:', phase2Index, 'Array length:', sessionData.phase2Ids.length);
                    return response.status(500).json({ error: "Phase 2 index out of bounds." });
                }
                
                const nextScenarioId = sessionData.phase2Ids[phase2Index];
                console.log('Next scenario ID:', nextScenarioId);
                
                if (!nextScenarioId) {
                    console.error('No scenario ID found at phase2Index:', phase2Index);
                    return response.status(500).json({ error: "Phase 2 scenario ID not found." });
                }
                
                sessionData.lastQuestionId = nextScenarioId;
                const nextScenarioData = questionBank.phase2.find(q => q.id === nextScenarioId);
                
                if (!nextScenarioData) {
                    console.error('No scenario data found for ID:', nextScenarioId);
                    console.error('Available Phase 2 IDs:', questionBank.phase2.map(q => q.id));
                    return response.status(500).json({ error: "Phase 2 scenario data not found." });
                }
                
                console.log('Phase 2 scenario found:', nextScenarioData.scenario.substring(0, 50) + '...');
                
                // Find options for top 3 domains
                const topOption = nextScenarioData.options.find(o => o.domain === top);
                const secondOption = nextScenarioData.options.find(o => o.domain === second);
                const thirdOption = nextScenarioData.options.find(o => o.domain === third);
                
                console.log('Options found:', { 
                    top: topOption ? 'found' : 'NOT FOUND',
                    second: secondOption ? 'found' : 'NOT FOUND',
                    third: thirdOption ? 'found' : 'NOT FOUND'
                });
                
                if (!topOption || !secondOption || !thirdOption) {
                    console.error('Missing options for domains:', { top, second, third });
                    console.error('Available options:', nextScenarioData.options.map(o => o.domain));
                    return response.status(500).json({ error: "Required domain options not found." });
                }
                
                nextQuestion = { 
                    scenario: nextScenarioData.scenario, 
                    options: [topOption, secondOption, thirdOption] 
                };
                
                console.log('Phase 2 question constructed successfully');
            
            } else {
                // Phase 2 is complete. Transition to Phase 3
                console.log('PHASE 2 COMPLETE: Transitioning to Phase 3');
                sessionData.questionNumber++; // Increment to 19
                const sortedScores = Object.entries(sessionData.scores).sort((a, b) => b[1] - a[1]);
                const primaryDomain = sortedScores[0][0];
                sessionData.primaryDomain = primaryDomain;
                sessionData.phase = 3;
                
                // ✅ FIXED: Use pre-randomized phase3Ids if available, otherwise randomize
                if (!sessionData.phase3Ids) {
                    sessionData.phase3Ids = questionBank.phase3.map(q => q.id).sort(() => 0.5 - Math.random());
                    console.log('Phase 3 questions randomized:', sessionData.phase3Ids);
                }
                
                sessionData.archetypeScores = {};
                const archetypes = Object.keys(questionBank.archetypes[primaryDomain]);
                archetypes.forEach(arch => { sessionData.archetypeScores[arch] = 0; });
                
                const nextQId = sessionData.phase3Ids.shift();
                sessionData.lastQuestionId = nextQId;
                const nextQData = questionBank.phase3.find(q => q.id === nextQId);
                const firstPhase3Question = { scenario: nextQData.scenario, options: nextQData.optionsByDomain[primaryDomain] };
                
                await kv.set(sessionId, sessionData);
                console.log('Session data saved, sending first Phase 3 question');
                
                return response.status(200).json({ 
                    status: 'archetypeQuestion', 
                    question: { ...firstPhase3Question, options: firstPhase3Question.options.sort(() => 0.5 - Math.random()) },
                    primaryDomain: questionBank.domains[primaryDomain],
                    questionNumber: sessionData.questionNumber
                });
            }

            console.log('=== SAVING SESSION AND SENDING RESPONSE ===');
            await kv.set(sessionId, sessionData);
            console.log('Session data saved successfully');
            
            const responseData = { 
                status: 'nextQuestion', 
                question: { ...nextQuestion, options: nextQuestion.options.sort(() => 0.5 - Math.random()) }, 
                questionNumber: sessionData.questionNumber 
            };
            
            console.log('Sending response:', {
                status: responseData.status,
                questionNumber: responseData.questionNumber,
                hasQuestion: !!responseData.question,
                hasOptions: !!responseData.question?.options
            });
            
            return response.status(200).json(responseData);
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
            
            if (sessionData.phase3Ids.length > 0) {
                sessionData.questionNumber++;
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
                
                // Save complete session data for future analysis
                await kv.set(sessionId, sessionData);
                
                return response.status(200).json({ 
                    status: 'finalResults', 
                    primaryDomain: questionBank.domains[sessionData.primaryDomain],
                    finalArchetype: finalArchetypeKey,
                    profileData: { ...finalProfile, domainDescription: questionBank.domains[sessionData.primaryDomain].description },
                    // Return detailed scores for analysis
                    detailedScores: {
                        domainScores: sessionData.scores,
                        archetypeScores: sessionData.archetypeScores,
                        sessionId: sessionId,
                        completedAt: new Date().toISOString()
                    }
                });
            }
        }
        
        console.log('Invalid action received:', action);
        return response.status(400).json({ error: "Invalid action." });
        
    } catch (error) {
        console.error('=== CRITICAL ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Request body:', JSON.stringify(request.body, null, 2));
        
        return response.status(500).json({ 
            error: 'An internal error occurred: ' + error.message,
            timestamp: new Date().toISOString()
        });
    } finally {
        console.log('=== API CALL END ===');
    }
}