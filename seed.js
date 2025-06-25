// seed.js
require('dotenv').config();
const { kv } = require('@vercel/kv');

async function seedDatabase() {
    console.log("Starting to seed database with NEW efficient Phase 3 structure...");

    const questionBank = {
        domains: {
            mentis: { id: 'mentis', name: 'Mentis', description: 'Processing information, generating insights, and providing expertise for informed decisions.' },
            imperii: { id: 'imperii', name: 'Imperii', description: 'Setting direction, driving change, and coordinating efforts toward strategic objectives.' },
            operis: { id: 'operis', name: 'Operis', description: 'Implementing plans, ensuring quality, and systematically executing complex work.' },
            foederis: { id: 'foederis', name: 'Foederis', description: 'Building relationships, supporting others, and facilitating collaborative team success.' }
        },
        archetypes: {
            mentis: { analyst: 'Analyst', innovator: 'Innovator', specialist: 'Specialist' },
            imperii: { commander: 'Commander', vanguard: 'Vanguard', pathfinder: 'Pathfinder', advocate: 'Advocate' },
            operis: { forgemaster: 'Forgemaster', finisher: 'Finisher', orchestrator: 'Orchestrator' },
            foederis: { ambassador: 'Ambassador', inspirer: 'Inspirer', peacekeeper: 'Peacekeeper', guardian: 'Guardian', shepherd: 'Shepherd' }
        },
        phase1: [ /* ...Phase 1 questions remain the same... */ 
            { 
                id: 'p1_01', 
                scenario: "You have just been assigned an important project with an ambitious goal and timeline. You are appointed the leader. What might be your first course of action?", 
                options: [
                    {text:"Rally the team around the vision, set clear expectations, and establish the strategic direction.", domain: 'imperii'}, 
                    {text:"Meet with each team member individually to understand their strengths, concerns, and how they can best contribute.", domain: 'foederis'}, 
                    {text:"Thoroughly analyse the project requirements, scope, and constraints.", domain: 'mentis'}
                ] 
            },
            { 
                id: 'p1_02', 
                scenario: "This is a new team, and people barely know each other. What might you do to establish an effective working relationship quickly?", 
                options: [
                    {text:"Create structured opportunities for collaboration through team activities.", domain: 'operis'}, 
                    {text:"Assess each person's expertise and working style for complementary skills.", domain: 'mentis'}, 
                    {text:"Organise a team alignment session to establish our shared goals, roles, and relationships.", domain: 'imperii'}
                ] 
            },
            { 
                id: 'p1_03', 
                scenario: "Two of your most valuable team members are in a heated disagreement about a key aspect of the project, and it's affecting the rest of the team. What might you do?", 
                options: [
                    {text:"Facilitate a conversation between the two members to find common ground.", domain: 'foederis'}, 
                    {text:"Establish a structured process for resolving the disagreement.", domain: 'operis'}, 
                    {text:"Make a decisive call on the direction we'll take and refocus everyone.", domain: 'imperii'}
                ] 
            },
            { 
                id: 'p1_04', 
                scenario: "A critical step was missed, and an important stakeholder is very upset. The team is lost on what to do. What might be your next step?", 
                options: [
                    {text:"Conduct a thorough analysis of what went wrong and what we can do now.", domain: 'mentis'}, 
                    {text:"Take ownership of the situation with the stakeholder while simultaneously mobilising the team for recovery.", domain: 'imperii'}, 
                    {text:"Implement immediate damage control measures through a step-by-step process.", domain: 'operis'}
                ] 
            },
            { 
                id: 'p1_05', 
                scenario: "It seems like there was a good plan for the project, but as you worked on it, it's proving to be more complex than the team anticipated. What might you do?", 
                options: [
                    {text:"Check in with team members about how they're handling the increased complexity and offer support.", domain: 'foederis'}, 
                    {text:"Reassess the situation by analysing what assumptions were incorrect and if our understanding changes.", domain: 'mentis'}, 
                    {text:"Redesign our approach with more detailed planning and contingency measures.", domain: 'operis'}
                ] 
            },
            { 
                id: 'p1_06', 
                scenario: "There's a new task that needs to be completed, but no one in your team - including yourself - currently possesses the skill to complete it. What might you do?", 
                options: [
                    {text:"Identify external experts or resources we can bring in while we develop ourselves.", domain: 'imperii'}, 
                    {text:"Research the skill requirements to understand exactly what expertise we need.", domain: 'mentis'}, 
                    {text:"Connect with other teams who might have this expertise and be willing to share knowledge.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p1_07', 
                scenario: "Your team achieved significant success and there's an opportunity for you to showcase the work to the media. What might you focus your sharing on?", 
                options: [
                    {text:"Your systematic methodology and execution excellence.", domain: 'operis'}, 
                    {text:"Your collaborative team effort and the positive impact our work will have on the community.", domain: 'foederis'}, 
                    {text:"Your innovative problem-solving approach and key insights that led to solutions.", domain: 'mentis'}
                ] 
            },
            { 
                id: 'p1_08', 
                scenario: "Some members of your team come up to you and share their gratitude for your leadership. They ask you to mentor them. How might you approach this request?", 
                options: [
                    {text:"Guide them in building leadership capabilities by providing opportunities to lead.", domain: 'imperii'}, 
                    {text:"Focus on their personal growth and relationship-building skills.", domain: 'foederis'}, 
                    {text:"Support their professional development through structured goal-setting and skill-building plans.", domain: 'operis'}
                ] 
            },
        ],
        phase2: [ /* ...Phase 2 questions remain the same... */ 
            { 
                id: 'p2_01', 
                scenario: "Your team's budget is running out, and you just got word that your grant application was unsuccessful. What might you do next?", 
                options: [
                    {text:"Analyse our current financial position and research all viable options first.", domain: 'mentis'}, 
                    {text:"Take immediate action to secure alternative funding while cutting costs.", domain: 'imperii'}, 
                    {text:"Create a detailed cost-cutting plan and timeline adjustments.", domain: 'operis'}, 
                    {text:"Reach out to network and partners to explore collaborative funding options.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_02', 
                scenario: "One team member consistently delivers subpar work and seems disengaged. His attitude is starting to affect the rest of the team, but he has specialised skills that the team needs. What might you do?", 
                options: [
                    {text:"Objectively assess the situation by documenting specific performance issues.", domain: 'mentis'}, 
                    {text:"Have a direct conversation about performance shortfall and expect improvement.", domain: 'imperii'}, 
                    {text:"Implement a structured performance improvement plan with specific milestones.", domain: 'operis'}, 
                    {text:"Try to understand what's causing the disengagement while protecting team morale.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_03', 
                scenario: "A key partner just had some staff changes, and the person you were working with had left. She is replaced by someone who questions everything your team had done. How might you deal with this?", 
                options: [
                    {text:"Prepare documentation and evidence of our work, rationale, and results.", domain: 'mentis'}, 
                    {text:"Take charge of resetting the relationship by clearly communicating our track record.", domain: 'imperii'}, 
                    {text:"Systematically walk them through our processes, methodologies, and quality standards.", domain: 'operis'}, 
                    {text:"Invest time in building trust with the new contact by finding common ground.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_04', 
                scenario: "A new project team has just launched and they do exactly the same thing you do. How might you react or respond to this news?", 
                options: [
                    {text:"Analyse their approach, capabilities, and potential impact to understand the competition.", domain: 'mentis'}, 
                    {text:"Double down on our strengths and accelerate our timeline to maintain our leading position.", domain: 'imperii'}, 
                    {text:"Focus on executing our plan with superior quality and efficiency, differentiating through excellence.", domain: 'operis'}, 
                    {text:"Explore opportunities for collaboration or knowledge sharing that could benefit both teams.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_05', 
                scenario: "Your team had just figured out a great way to use generative AI to serve your end users. But it requires a lot of time investment. What might you do?", 
                options: [
                    {text:"Evaluate the potential return on investment, risks, and long-term implications.", domain: 'mentis'}, 
                    {text:"Champion this innovation as a strategic advantage and rally resources to pursue it.", domain: 'imperii'}, 
                    {text:"Create a phased implementation plan that allows us to develop the AI solution while maintaining work-as-usual.", domain: 'operis'}, 
                    {text:"Gauge team enthusiasm and capacity for this additional work.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_06', 
                scenario: "Half of your team need to leave the project team due to scholarships and studies. You need to recruit more team members. What might you do?", 
                options: [
                    {text:"Assess exactly what skills and knowledge we're losing and plan criteria for replacements.", domain: 'mentis'}, 
                    {text:"Quickly mobilise recruitment efforts while restructuring responsibilities to maintain momentum.", domain: 'imperii'}, 
                    {text:"Develop a systematic onboarding process and knowledge transfer plan for new members.", domain: 'operis'}, 
                    {text:"Leverage our network and team members' connections to find people who would be a good cultural fit.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_07', 
                scenario: "Team members are starting to have different interpretations of what success looks like for your project. What might you do?", 
                options: [
                    {text:"Facilitate an objective analysis of our original goals and current situation.", domain: 'mentis'}, 
                    {text:"Bring everyone together to establish a clear, shared definition of success.", domain: 'imperii'}, 
                    {text:"Create specific, measurable success criteria and milestones that leave no room for interpretation.", domain: 'operis'}, 
                    {text:"Host team discussions to understand different perspectives and build consensus.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_08', 
                scenario: "Someone told you a secret relating to the project work, and you know it will help your team greatly - but this secret is confidential. What might you do?", 
                options: [
                    {text:"Analyse the ethical implications and potential consequences of handling this information.", domain: 'mentis'}, 
                    {text:"Find ways to guide the team toward the same insights without revealing the confidential information.", domain: 'imperii'}, 
                    {text:"Respect the confidentiality while systematically exploring legitimate ways to achieve similar benefits.", domain: 'operis'}, 
                    {text:"Approach the person who shared the secret to discuss whether there are ways to share this information.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_09', 
                scenario: "You are invited to send only two of your team members to Japan for a reward trip and learning opportunity, but you have a larger team and everyone wants to go. What might you do?", 
                options: [
                    {text:"Establish objective criteria for selection based on contribution, development needs, and potential benefit.", domain: 'mentis'}, 
                    {text:"Make a decisive choice based on strategic value while clearly communicating the rationale.", domain: 'imperii'}, 
                    {text:"Create a fair, transparent selection process that considers multiple factors and is equitable.", domain: 'operis'}, 
                    {text:"Explore creative alternatives like having the selected members share learnings and spread other trips around.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_10', 
                scenario: "A team member has accidentally deleted your entire project's Google Drive folder. It is irretrievable and he feels terrible. What might you do?", 
                options: [
                    {text:"Assess exactly what was lost and what can be recovered from other sources.", domain: 'mentis'}, 
                    {text:"Take charge of damage control while mobilising everyone to rebuild critical materials.", domain: 'imperii'}, 
                    {text:"Implement immediate backup procedures and create a systematic plan to reconstruct critical documents.", domain: 'operis'}, 
                    {text:"Support the team member who made the mistake while rallying everyone to work together on recovery.", domain: 'foederis'}
                ] 
            }
        ],
        // UPDATED: New efficient structure for Phase 3
        phase3: [
            {
                id: 'p3_01',
                scenario: "When contributing to a team's success, what drives you most fundamentally?",
                optionsByDomain: {
                    mentis: [{text: "Providing objective evaluation and sound judgment to prevent poor decisions.", archetype: "analyst"}, {text: "Generating breakthrough ideas and creative solutions to complex problems.", archetype: "innovator"}, {text: "Sharing deep expertise and maintaining technical excellence.", archetype: "specialist"}],
                    imperii: [{text: "Coordinating strategic direction and ensuring aligned decision-making.", archetype: "commander"}, {text: "Driving momentum and pushing through obstacles to achieve results.", archetype: "vanguard"}, {text: "Exploring new possibilities and helping teams adapt to change.", archetype: "pathfinder"}, {text: "Championing meaningful purposes and ensuring principled action.", archetype: "advocate"}],
                    operis: [{text: "Transforming plans into systematic, reliable execution.", archetype: "forgemaster"}, {text: "Ensuring excellence and error-free delivery of results.", archetype: "finisher"}, {text: "Creating structure and coordinating complex operations.", archetype: "orchestrator"}],
                    foederis: [{text: "Building external relationships and expanding team influence.", archetype: "ambassador"}, {text: "Motivating others and maintaining positive team energy.", archetype: "inspirer"}, {text: "Facilitating harmony and resolving conflicts constructively.", archetype: "peacekeeper"}, {text: "Protecting the team from risks and maintaining security.", archetype: "guardian"}, {text: "Serving team needs and supporting individual member success.", archetype: "shepherd"}]
                }
            },
            // Add your other 6 Phase 3 scenarios here in the same format
            { 
                id: 'p3_02', 
                scenario: "What gives you the deepest sense of fulfillment in team environments?", 
                optionsByDomain: { /* ... all domain options ... */ 
                    mentis: [{text: "When my careful analysis helps the team avoid costly mistakes or poor choices.", archetype: "analyst"}, {text: "When my creative ideas breakthrough conventional thinking and open new possibilities.", archetype: "innovator"}, {text: "When my expertise enables the team to achieve technically excellent outcomes.", archetype: "specialist"}],
                    imperii: [{text: "When I successfully coordinate diverse efforts toward a shared strategic vision.", archetype: "commander"}, {text: "When I drive the team through challenges others thought were insurmountable.", archetype: "vanguard"}, {text: "When I help the team discover opportunities and successfully navigate change.", archetype: "pathfinder"}, {text: "When our work serves a higher purpose and creates meaningful positive impact.", archetype: "advocate"}],
                    operis: [{text: "When abstract concepts become concrete realities through systematic execution.", archetype: "forgemaster"}, {text: "When we deliver flawless results that exceed quality expectations.", archetype: "finisher"}, {text: "When complex operations flow smoothly through well-designed processes.", archetype: "orchestrator"}],
                    foederis: [{text: "When external partnerships and connections create new opportunities for the team.", archetype: "ambassador"}, {text: "When team members feel energised and motivated to achieve their best work.", archetype: "inspirer"}, {text: "When conflicts are resolved and everyone feels heard and valued.", archetype: "peacekeeper"}, {text: "When the team feels secure and protected from potential threats.", archetype: "guardian"}, {text: "When individual team members grow and succeed through my support.", archetype: "shepherd"}]
                } 
            },
            { 
                id: 'p3_03', 
                scenario: "When your team faces a significant challenge, what is your instinctive response?", 
                optionsByDomain: { /* ... all domain options ... */ 
                    mentis: [{text: "Systematically evaluate all options to identify the most logical solution.", archetype: "analyst"}, {text: "Question conventional approaches and explore creative alternatives.", archetype: "innovator"}, {text: "Apply deep knowledge and proven expertise to address the challenge.", archetype: "specialist"}],
                    imperii: [{text: "Take charge of coordinating the response and making necessary decisions.", archetype: "commander"}, {text: "Push forward aggressively to overcome obstacles and maintain momentum.", archetype: "vanguard"}, {text: "Look for new approaches and help the team adapt to changing circumstances.", archetype: "pathfinder"}, {text: "Ensure our response aligns with our principles and serves the greater good.", archetype: "advocate"}],
                    operis: [{text: "Develop a systematic plan and execute it step-by-step reliably.", archetype: "forgemaster"}, {text: "Focus on delivering a high-quality solution with attention to all details.", archetype: "finisher"}, {text: "Organise resources and coordinate efforts for maximum efficiency.", archetype: "orchestrator"}],
                    foederis: [{text: "Leverage external relationships and resources to support the solution.", archetype: "ambassador"}, {text: "Rally team spirits and maintain positive energy throughout the challenge.", archetype: "inspirer"}, {text: "Ensure team unity and collaborative problem-solving approaches.", archetype: "peacekeeper"}, {text: "Assess risks carefully and protect the team from potential negative consequences.", archetype: "guardian"}, {text: "Support team members through the difficulty and ensure everyone contributes.", archetype: "shepherd"}]
                } 
            },
            { 
                id: 'p3_04', 
                scenario: "What do you believe is most important when guiding or influencing others?", 
                optionsByDomain: { /* ... all domain options ... */ 
                    mentis: [{text: "Providing clear, objective insights that help others make informed decisions.", archetype: "analyst"}, {text: "Inspiring others to think differently and embrace new possibilities.", archetype: "innovator"}, {text: "Sharing knowledge and maintaining high standards of excellence.", archetype: "specialist"}],
                    imperii: [{text: "Setting clear direction and coordinating efforts toward shared goals.", archetype: "commander"}, {text: "Motivating others to push beyond their comfort zones and achieve more.", archetype: "vanguard"}, {text: "Helping others embrace change and discover new opportunities.", archetype: "pathfinder"}, {text: "Inspiring others to pursue meaningful work that serves important purposes.", archetype: "advocate"}],
                    operis: [{text: "Helping others translate ideas into concrete, actionable plans.", archetype: "forgemaster"}, {text: "Teaching others the importance of quality and attention to detail.", archetype: "finisher"}, {text: "Creating systems that enable others to work more effectively.", archetype: "orchestrator"}],
                    foederis: [{text: "Connecting others with valuable relationships and external opportunities.", archetype: "ambassador"}, {text: "Helping others see their potential and feel motivated to achieve it.", archetype: "inspirer"}, {text: "Creating environments where everyone feels heard and valued.", archetype: "peacekeeper"}, {text: "Protecting others from risks while helping them feel secure.", archetype: "guardian"}, {text: "Serving others' growth and development with genuine care.", archetype: "shepherd"}]
                } 
            },
            { 
                id: 'p3_05', 
                scenario: "In your interactions with team members, what matters most to you?", 
                optionsByDomain: { /* ... all domain options ... */ 
                    mentis: [{text: "Being seen as trustworthy and objective in my assessments and advice.", archetype: "analyst"}, {text: "Encouraging others to think creatively and challenge assumptions.", archetype: "innovator"}, {text: "Being respected for my expertise and technical knowledge.", archetype: "specialist"}],
                    imperii: [{text: "Maintaining clear communication and mutual accountability.", archetype: "commander"}, {text: "Pushing each other toward higher performance and better results.", archetype: "vanguard"}, {text: "Exploring new ideas together and supporting each other through change.", archetype: "pathfinder"}, {text: "Working together toward purposes that matter and make a difference.", archetype: "advocate"}],
                    operis: [{text: "Building reliable working relationships based on consistent delivery.", archetype: "forgemaster"}, {text: "Maintaining high standards and shared commitment to excellence.", archetype: "finisher"}, {text: "Coordinating effectively and supporting smooth collaboration.", archetype: "orchestrator"}],
                    foederis: [{text: "Building genuine connections and expanding our collective network.", archetype: "ambassador"}, {text: "Creating positive energy and helping others feel valued and motivated.", archetype: "inspirer"}, {text: "Maintaining harmony and ensuring everyone feels included.", archetype: "peacekeeper"}, {text: "Creating trust and ensuring everyone feels safe and supported.", archetype: "guardian"}, {text: "Genuinely caring for others' wellbeing and personal success.", archetype: "shepherd"}]
                } 
            },
            { 
                id: 'p3_06', 
                scenario: "How do you define a truly successful team outcome?", 
                optionsByDomain: { /* ... all domain options ... */ 
                    mentis: [{text: "When decisions are made based on sound analysis and logical reasoning.", archetype: "analyst"}, {text: "When breakthrough solutions create new possibilities and capabilities.", archetype: "innovator"}, {text: "When technical excellence and expertise lead to superior outcomes.", archetype: "specialist"}],
                    imperii: [{text: "When strategic coordination leads to achieving ambitious shared goals.", archetype: "commander"}, {text: "When the team overcomes significant challenges through determined effort.", archetype: "vanguard"}, {text: "When our achievements serve meaningful purposes and create positive impact.", archetype: "pathfinder"}, {text: ".", archetype: "advocate"}],
                    operis: [{text: "When systematic execution transforms plans into tangible, reliable results.", archetype: "forgemaster"}, {text: "When deliverables meet the highest standards of quality and excellence.", archetype: "finisher"}, {text: "When coordinated efforts produce efficient, well-organised outcomes.", archetype: "orchestrator"}],
                    foederis: [{text: "When external partnerships and relationships enhance our collective success.", archetype: "ambassador"}, {text: "When team members feel energised and proud of what we accomplished together.", archetype: "inspirer"}, {text: "When success is achieved through collaboration and mutual respect.", archetype: "peacekeeper"}, {text: "When goals are met while maintaining team security and stability.", archetype: "guardian"}, {text: "When success includes the growth and development of individual team members.", archetype: "shepherd"}]
                } 
            },
            { 
                id: 'p3_07', 
                scenario: "Which principle guides your behavior most strongly in team settings?", 
                optionsByDomain: { /* ... all domain options ... */ 
                    mentis: [{text: "Truth and objectivity should guide all important decisions.", archetype: "analyst"}, {text: "Innovation and creativity are essential for breakthrough results.", archetype: "innovator"}, {text: "Expertise and technical excellence ensure the best outcomes.", archetype: "specialist"}],
                    imperii: [{text: "Clear leadership and coordination are essential for team success.", archetype: "commander"}, {text: "Persistence and determination overcome any obstacle.", archetype: "vanguard"}, {text: "Adaptability and exploration lead to the best opportunities.", archetype: "pathfinder"}, {text: "Meaningful purpose and ethical principles must guide all actions.", archetype: "advocate"}],
                    operis: [{text: "Systematic execution and reliability deliver consistent results.", archetype: "forgemaster"}, {text: "Quality and excellence should never be compromised.", archetype: "finisher"}, {text: "Organisation and coordination maximise team effectiveness.", archetype: "orchestrator"}],
                    foederis: [{text: "Relationships and connections create the greatest opportunities.", archetype: "ambassador"}, {text: "Positive energy and motivation bring out everyone's best performance.", archetype: "inspirer"}, {text: "Harmony and collaboration produce the strongest outcomes.", archetype: "peacekeeper"}, {text: "Security and protection enable teams to perform their best work.", archetype: "guardian"}, {text: "Service and care for others create the most fulfilling success.", archetype: "shepherd"}]
                } 
            },
        ]
    };

    await kv.set('ari-v2-question-bank', questionBank);
    console.log("Database seeded successfully with new efficient Phase 3 structure!");
}

seedDatabase();