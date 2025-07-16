// seed.js
import dotenv from 'dotenv';
import { kv } from '@vercel/kv';

dotenv.config();

async function seedDatabase() {
    console.log("Starting to seed database with NEW efficient Phase 3 structure...");

    const questionBank = {
        domains: {
            mentis: { id: 'mentis', name: 'Mentis', description: 'Excellent at processing information, generating insights, and providing expertise for informed decisions.' },
            imperii: { id: 'imperii', name: 'Imperii', description: 'Natural at setting direction, driving change, and coordinating efforts toward strategic objectives.' },
            operis: { id: 'operis', name: 'Operis', description: 'Proficient in implementing plans, ensuring quality, and systematically executing complex work.' },
            foederis: { id: 'foederis', name: 'Foederis', description: 'Talented in building relationships, supporting others, and facilitating collaborative team success.' }
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
                scenario: "You've just been appointed a leader of a new project, and given some ambitious goals! What might be the first thing you do with the team?", 
                options: [
                    {text:"Set a vision and get the team on board with it, setting clear expectations for all.", domain: 'imperii'}, 
                    {text:"Meet with each team member individually to understand their strengths and concerns.", domain: 'foederis'}, 
                    {text:"Analyse the project goals, scope, and your team's resources carefully.", domain: 'mentis'}
                ] 
            },
            { 
                id: 'p1_02', 
                scenario: "It's a newly formed team and people don't know each other! What might you do to warm things up?", 
                options: [
                    {text:"Run teambuilding sessions.", domain: 'operis'}, 
                    {text:"Assess each person's expertise and working style to complement each other.", domain: 'mentis'}, 
                    {text:"Organise a team session to talk about shared goals, roles, and relationships.", domain: 'imperii'}
                ] 
            },
            { 
                id: 'p1_03', 
                scenario: "Two team members are in a heated disagreement, and the rest look a bit uncomfortable. What might you do?", 
                options: [
                    {text:"Facilitate a private discussion for them to find common ground.", domain: 'foederis'}, 
                    {text:"Set up a step-by-step process to resolve the disagreement.", domain: 'operis'}, 
                    {text:"Make the call as the leader, setting the direction we'll take and refocusing everyone.", domain: 'imperii'}
                ] 
            },
            { 
                id: 'p1_04', 
                scenario: "Something went wrong and a partner is really upset. The team is lost on what to do. What might be your next step?", 
                options: [
                    {text:"Conduct a root-cause analysis of what went wrong and think about what we can do moving forward.", domain: 'mentis'}, 
                    {text:"Call the partner for damage control, and simultaneously direct the team on what to do for recovery.", domain: 'imperii'}, 
                    {text:"Implement damage control measures through a structured process.", domain: 'operis'}
                ] 
            },
            { 
                id: 'p1_05', 
                scenario: "The project has shifted quite badly off what was initially planned because of unexpected complexity. What might you do?", 
                options: [
                    {text:"Check in with team members about how they're handling the increased complexity and offer your support.", domain: 'foederis'}, 
                    {text:"Reassess our project assumptions and see if our understanding changes, before taking action.", domain: 'mentis'}, 
                    {text:"Redesign our approach with more detailed planning and contingency measures.", domain: 'operis'}
                ] 
            },
            { 
                id: 'p1_06', 
                scenario: "There's a new task and no one has the skill to complete it! What might you do?", 
                options: [
                    {text:"Look for experts or resources to help us immediately, while we take time to grow ourselves.", domain: 'imperii'}, 
                    {text:"Research the skill requirements to understand exactly what expertise we need.", domain: 'mentis'}, 
                    {text:"Connect with other teams who might have this expertise and ask for their favour and help.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p1_07', 
                scenario: "Your project is a success! A journalist is writing a feature on your team and your work. What do you focus the feature on?", 
                options: [
                    {text:"Your systematic methodology and execution excellence.", domain: 'operis'}, 
                    {text:"Your collaborative team effort and the positive impact our work will have on the community.", domain: 'foederis'}, 
                    {text:"Your innovative problem-solving approach and key ideas that led to solutions.", domain: 'mentis'}
                ] 
            },
            { 
                id: 'p1_08', 
                scenario: "Some members of your team are grateful for your leadership and ask you to mentor them. How might you approach this request?", 
                options: [
                    {text:"Build their leadership capabilities by providing opportunities to lead.", domain: 'imperii'}, 
                    {text:"Focus on their relationship-building and networking skills.", domain: 'foederis'}, 
                    {text:"Co-develop their professional development plans with structured goal-setting and skill-building.", domain: 'operis'}
                ] 
            },
        ],
        phase2: [ /* ...Phase 2 questions remain the same... */ 
            { 
                id: 'p2_01', 
                scenario: "The project budget is running out! What might you do next?", 
                options: [
                    {text:"Analyse our current financial position and research all viable options first.", domain: 'mentis'}, 
                    {text:"Take immediate action to get alternative funding and start cutting cost.", domain: 'imperii'}, 
                    {text:"Create a detailed cost-cutting plan and adjustments to project timeline.", domain: 'operis'}, 
                    {text:"Reach out to network and partners to explore collaborative funding options.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_02', 
                scenario: "One team member is really not performing and seems disengaged. His attitude is starting to affect the rest of the team, but he has specialised skills that the team needs. What might you do?", 
                options: [
                    {text:"Be objective. Document specific performance issues as you assess further.", domain: 'mentis'}, 
                    {text:"Have a direct 1:1 conversation about performance issues and set expectations for improvement.", domain: 'imperii'}, 
                    {text:"Implement a structured performance improvement plan with specific milestones.", domain: 'operis'}, 
                    {text:"Speak to him to understand what's causing the disengagement, while protecting team morale.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_03', 
                scenario: "One of your partner organisations had a staff change. The new staff questions everything your team had done. How might you deal with this?", 
                options: [
                    {text:"Prepare clear documentation and evidence of our work, rationale, and results.", domain: 'mentis'}, 
                    {text:"Take charge of resetting the relationship, and show the work done.", domain: 'imperii'}, 
                    {text:"Walk them through our processes, methodologies, and quality standards step-by-step.", domain: 'operis'}, 
                    {text:"Invest time in building trust with the new contact by finding common ground.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_04', 
                scenario: "You've got a new competitor that does exactly what you do! How might you react or respond?", 
                options: [
                    {text:"Analyse their approach, capabilities, and potential impact to understand the competition.", domain: 'mentis'}, 
                    {text:"Double down on our strengths and accelerate our timeline to maintain our leading position.", domain: 'imperii'}, 
                    {text:"Focus on executing our plan with superior quality and efficiency, differentiating through excellence.", domain: 'operis'}, 
                    {text:"Explore opportunities for collaboration or knowledge sharing that could benefit both teams.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_05', 
                scenario: "Your team had just figured out a great way to use AI in the project, but it requires a lot of time investment. What might you do?", 
                options: [
                    {text:"Evaluate the potential return on investment, risks, and long-term implications.", domain: 'mentis'}, 
                    {text:"Champion this innovation as a strategic advantage and gather resources to pursue it.", domain: 'imperii'}, 
                    {text:"Create a phased implementation plan that allows us to develop the AI solution while maintaining work-as-usual.", domain: 'operis'}, 
                    {text:"Ask the team if they have the enthusiasm and capacity for this additional work.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_06', 
                scenario: "Half the team has been reassigned to another project, and you need to recruit more team members. What might you do?", 
                options: [
                    {text:"Assess exactly what skills and knowledge we're losing and plan the criteria for replacements.", domain: 'mentis'}, 
                    {text:"Quickly mobilise recruitment efforts while restructuring responsibilities to maintain momentum.", domain: 'imperii'}, 
                    {text:"Develop a systematic onboarding process and knowledge transfer plan for new members.", domain: 'operis'}, 
                    {text:"Leverage our network and team members' connections to find people who would be a good cultural fit.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_07', 
                scenario: "Team members are starting to have different ideas around what success looks like. What might you do?", 
                options: [
                    {text:"Conduct an objective analysis of our original goals and current situation.", domain: 'mentis'}, 
                    {text:"Hold a town hall to establish a clear, shared definition of success.", domain: 'imperii'}, 
                    {text:"Create specific, measurable success criteria and leave no room for interpretation.", domain: 'operis'}, 
                    {text:"Host team discussions to understand different perspectives and build consensus.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_08', 
                scenario: "Someone told you a secret relating to the project work, and you know it will help your team greatly - but this secret is confidential. What might you do?", 
                options: [
                    {text:"Analyse the pros and cons, and ethical concerns, of handling this information.", domain: 'mentis'}, 
                    {text:"Creatively guide the team toward the key insights without revealing the confidential information.", domain: 'imperii'}, 
                    {text:"Respect the confidentiality while exploring legitimate ways to achieve similar benefits.", domain: 'operis'}, 
                    {text:"Approach the person who shared the secret to discuss whether there are ways to share this information.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_09', 
                scenario: "You are invited to send only two of your team members to Japan for a reward trip and learning opportunity, but you have a larger team and everyone wants to go. What might you do?", 
                options: [
                    {text:"Create an objective selection rubric based on contribution, development needs, and potential benefit.", domain: 'mentis'}, 
                    {text:"Make the decision as the leader, based on strategic value and clearly communicate the rationale to the team.", domain: 'imperii'}, 
                    {text:"Set up a fair and transparent selection process with equitable and open criteria.", domain: 'operis'}, 
                    {text:"Explore creative alternatives like having the selected members share learnings and spread other trips around.", domain: 'foederis'}
                ] 
            },
            { 
                id: 'p2_10', 
                scenario: "A team member has accidentally deleted your entire project's Google Drive folder. What might you do?", 
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
                    imperii: [{text: "When strategic coordination leads to achieving ambitious shared goals.", archetype: "commander"}, {text: "When the team overcomes significant challenges through determined effort.", archetype: "vanguard"}, {text: "When adaptation and exploration lead to better opportunities and outcomes.", archetype: "pathfinder"}, {text: "When our achievements serve meaningful purposes and create positive impact.", archetype: "advocate"}],
                    operis: [{text: "When systematic execution transforms plans into tangible, reliable results.", archetype: "forgemaster"}, {text: "When deliverables meet the highest standards of quality and excellence.", archetype: "finisher"}, {text: "When coordinated efforts produce efficient, well-organised outcomes.", archetype: "orchestrator"}],
                    foederis: [{text: "When external partnerships and relationships enhance our collective success.", archetype: "ambassador"}, {text: "When team members feel energised and proud of what we accomplished together.", archetype: "inspirer"}, {text: "When success is achieved through collaboration and mutual respect.", archetype: "peacekeeper"}, {text: "When goals are met while maintaining team security and stability.", archetype: "guardian"}, {text: "When success includes the growth and development of individual team members.", archetype: "shepherd"}]
                } 
            },
            { 
                id: 'p3_07', 
                scenario: "Which principle guides your behaviour most strongly in team settings?", 
                optionsByDomain: { /* ... all domain options ... */ 
                    mentis: [{text: "Truth and objectivity should guide all important decisions.", archetype: "analyst"}, {text: "Innovation and creativity are essential for breakthrough results.", archetype: "innovator"}, {text: "Expertise and technical excellence ensure the best outcomes.", archetype: "specialist"}],
                    imperii: [{text: "Clear leadership and coordination are essential for team success.", archetype: "commander"}, {text: "Persistence and determination overcome any obstacle.", archetype: "vanguard"}, {text: "Adaptability and exploration lead to the best opportunities.", archetype: "pathfinder"}, {text: "Meaningful purpose and ethical principles must guide all actions.", archetype: "advocate"}],
                    operis: [{text: "Systematic execution and reliability deliver consistent results.", archetype: "forgemaster"}, {text: "Quality and excellence should never be compromised.", archetype: "finisher"}, {text: "Organisation and coordination maximise team effectiveness.", archetype: "orchestrator"}],
                    foederis: [{text: "Relationships and connections create the greatest opportunities.", archetype: "ambassador"}, {text: "Positive energy and motivation bring out everyone's best performance.", archetype: "inspirer"}, {text: "Harmony and collaboration produce the strongest outcomes.", archetype: "peacekeeper"}, {text: "Security and protection enable teams to perform their best work.", archetype: "guardian"}, {text: "Service and care for others create the most fulfilling success.", archetype: "shepherd"}]
                } 
            },
        ],
        // ... inside the questionBank object in seed.js
        profiles: {
            // --- MENTIS ARCHETYPES ---
            analyst: {
                quote: "Let me evaluate our options and provide clear judgment",
                teamRole: "Analysts are natural evaluators who process information systematically to provide objective assessments. In a team, they tend to gravitate toward reviewing proposals, identifying risks, and offering measured recommendations. Analysts thrive when given time to analyse before making pronouncements.",
                strengths: ["Spots flaws and inconsistencies others miss", "Provides balanced, unbiased perspective on decisions", "Prevents teams from rushing into poor choices", "Excels at weighing pros and cons methodically", "Maintains objectivity under pressure"],
                blindspots: ["May over-analyse and slow down urgent decisions", "Can appear overly critical or negative", "Might miss emotional/interpersonal factors in analysis", "Tendency to get lost in details and lose big picture", "May struggle with ambiguous or incomplete information"],
                impact: {
                    dos: ["Set clear deadlines for analysis to avoid endless deliberation", "Balance critical assessment with constructive alternatives", "Communicate findings in accessible, actionable terms"],
                    avo: ["Analysis paralysis - perfect information is rarely available", "Becoming the team's default pessimist or roadblock"]
                },
                synergy: {
                    high: ["The Innovator: Provides creative alternatives while Analyst evaluates feasibility", "The Forgemaster: Analyst's evaluation guides systematic implementation", "The Commander: Strategic decisions benefit from analytical assessment"],
                    low: ["The Vanguard: Analysis pace clashes with urgency to act", "The Inspirer: Critical analysis can dampen motivational energy", "The Pathfinder: Methodical evaluation conflicts with rapid exploration"]
                }
            },
            innovator: {
                quote: "What if we tried something completely different?",
                teamRole: "Innovators are creative catalysts who generate novel solutions and challenges conventional thinking. In a team, they naturally question existing approaches and offer imaginative alternatives. Innovators are energised by brainstorming and blue-sky thinking sessions.",
                strengths: ["Breaks teams out of conventional thought patterns", "Generates multiple creative alternatives to problems", "Sees possibilities others overlook", "Comfortable with ambiguity and uncertainty", "Inspires fresh perspectives and approaches"],
                blindspots: ["Ideas may be impractical or resource-intensive", "Can become bored with implementation details", "May dismiss practical constraints too quickly", "Tendency to jump to new ideas before finishing current ones", "Sometimes struggles with incremental improvements"],
                impact: {
                    dos: ["Partner with Implementers to ground ideas in reality", "Focus creative energy on the team's biggest challenges", "Build on others' ideas rather than always starting fresh"],
                    avo: ["Generating ideas without considering feasibility", "Abandoning concepts before they're properly explored"]
                },
                synergy: {
                    high: ["The Analyst: Provides reality-check and evaluation of innovative ideas", "The Forgemaster: Transforms creative concepts into actionable plans", "The Pathfinder: Both explore new possibilities and adapt to change"],
                    low: ["The Finisher: Creative chaos clashes with perfectionist structure", "The Specialist: Novel approaches conflict with established expertise", "The Orchestrator: Innovation disrupts systematic processes"]
                }
            },
            specialist: {
                quote: "Here's what the research and experience tell us",
                teamRole: "Specialists are deep domain experts who provide authoritative knowledge and maintains technical standards. In a team they naturally become the go-to person for specialised information and ensure decisions are technically sound.",
                strengths: ["Provides crucial expertise that prevents costly mistakes", "Maintains high standards within their domain", "Offers credible, evidence-based recommendations", "Keeps team grounded in proven practices", "Serves as reliable knowledge resource"],
                blindspots: ["May become territorial about their area of expertise", "Can get stuck in \"that's not how we do it\" thinking", "Might overload team with technical details", "Tendency to focus narrowly on their specialty", "May resist cross-functional collaboration"],
                impact: {
                    dos: ["Translate expertise into accessible business language", "Stay curious about developments outside your domain", "Mentor others to build team capability"],
                    avo: ["Being the bottleneck for all domain-related decisions", "Dismissing insights from outside your specialty"]
                },
                synergy: {
                    high: ["The Analyst: Expert knowledge enhances analytical evaluation", "The Orchestrator: Specialised expertise guides process design", "The Guardian: Technical knowledge helps identify real risks"],
                    low: ["The Innovator: Established expertise clashes with novel approaches", "The Vanguard: Technical constraints conflict with drive to push forward", "The Advocate: Specialised focus conflicts with broader principled concerns"]
                }
            },

            // --- IMPERII ARCHETYPES ---
            commander: {
                quote: "I'll coordinate our efforts and make the key decisions",
                teamRole: "Commanders are strategic leaders who naturally take charge of coordination and decision-making. In a team, they gravitate toward setting direction, delegating effectively, and ensuring team alignment on objectives and priorities.",
                strengths: ["Provides clear direction and accountability", "Excellent at seeing big picture and strategic connections", "Delegates effectively based on team members' strengths", "Makes difficult decisions when needed", "Creates structure from chaos"],
                blindspots: ["May become overly controlling or micromanaging", "Can dismiss input that challenges their vision", "Might not invest enough time in team development", "Tendency to take on too much responsibility", "May struggle with consensus-building approaches"],
                impact: {
                    dos: ["Regularly seek input before making major decisions", "Develop other team members' leadership capabilities", "Communicate the 'why' behind decisions clearly"],
                    avo: ["Making unilateral decisions on collaborative matters", "Becoming indispensable to every team function"]
                },
                synergy: {
                    high: ["The Analyst: Strategic decisions benefit from objective evaluation", "The Orchestrator: Coordination skills complement systematic execution", "The Ambassador: External relationships support strategic objectives"],
                    low: ["The Advocate: Strategic pragmatism clashes with principled positions", "The Peacekeeper: Decisive leadership conflicts with consensus-building", "The Pathfinder: Strategic stability conflicts with constant exploration"]
                }
            },
            vanguard: {
                quote: "We need to push through these obstacles and maintain momentum",
                teamRole: "Vanguards are dynamic drivers who push teams through challenges and maintain forward momentum. They naturally confront problems head-on, challenge complacency, and ensure the team doesn't stall or lose focus.",
                strengths: ["Maintains urgency and drives results", "Confronts difficult issues others avoid", "Pushes team to higher performance levels", "Excellent in crisis situations", "Prevents stagnation and complacency"],
                blindspots: ["May be too aggressive or impatient with team members", "Can create unnecessary conflict or tension", "Might push for action before adequate planning", "Tendency to overlook people's emotional needs", "May burn out themselves and others"],
                impact: {
                    dos: ["Channel drive toward the team's biggest priorities", "Balance urgency with team member wellbeing", "Recognise when to ease pressure vs. increase it"],
                    avo: ["Creating a constantly high-stress environment", "Pushing forward without considering different perspectives"]
                },
                synergy: {
                    high: ["The Forgemaster: Drive provides momentum for systematic implementation", "The Inspirer: Urgency combines with motivation for powerful results", "The Guardian: Pushes forward while Guardian manages risks"],
                    low: ["The Analyst: Urgency to act clashes with need for thorough analysis", "The Peacekeeper: Aggressive push conflicts with harmony maintenance", "The Shepherd: Task focus conflicts with people-first orientation"]
                }
            },
            pathfinder: {
                quote: "Let's explore new possibilities and adapt to these changes",
                teamRole: "Pathfinders are adaptive explorers who help teams navigate uncertainty and discover new opportunities. They naturally embrace change, scout ahead for possibilities, and helps teams evolve with shifting circumstances.",
                strengths: ["Helps team adapt quickly to changing conditions", "Spots emerging opportunities before others", "Comfortable with ambiguity and uncertainty", "Brings fresh perspectives from outside the team", "Excellent at scenario planning and contingencies"],
                blindspots: ["May chase too many opportunities without focus", "Can be restless with stable, routine work", "Might undervalue existing successful approaches", "Tendency to create change for change's sake", "May struggle with detailed follow-through"],
                impact: {
                    dos: ["Focus exploration on strategic opportunities", "Help team prepare for likely future scenarios", "Balance innovation with stability"],
                    avo: ["Constantly shifting direction without clear rationale", "Abandoning proven methods too quickly"]
                },
                synergy: {
                    high: ["The Innovator: Both explore new possibilities and creative solutions", "The Ambassador: External connections support opportunity discovery", "The Analyst: Exploration benefits from objective evaluation of options"],
                    low: ["The Specialist: Constant change conflicts with established expertise", "The Finisher: Exploration disrupts perfectionist completion", "The Commander: Ongoing adaptation conflicts with strategic stability"]
                }
            },
            advocate: {
                quote: "We need to champion what's right and drive meaningful change",
                teamRole: "Advocates are principled champions who drive teams toward higher purposes and meaningful impact. They naturally fight for important causes, maintain ethical standards, and ensure team actions align with values.",
                strengths: ["Keeps team focused on meaningful, worthwhile goals", "Maintains high ethical and quality standards", "Motivates through connection to larger purpose", "Willing to take stands on important issues", "Brings passion and conviction to team efforts"],
                blindspots: ["May become rigid about principles vs. practical needs", "Can be seen as preachy or overly idealistic", "Might create conflict over values differences", "Tendency to take criticism of ideas personally", "May struggle with necessary compromises"],
                impact: {
                    dos: ["Connect team work to broader organisational mission", "Choose battles wisely - not every issue is worth fighting", "Listen to different perspectives on complex issues"],
                    avo: ["Becoming inflexible about methods while staying true to values", "Alienating others through overly aggressive advocacy"]
                },
                synergy: {
                    high: ["The Inspirer: Principled purpose enhances motivational energy", "The Shepherd: Both care deeply about serving others' wellbeing", "The Guardian: Shared commitment to protecting what matters"],
                    low: ["The Commander: Principled positions clash with strategic pragmatism", "The Forgemaster: Idealistic goals conflict with practical constraints", "The Analyst: Passionate advocacy conflicts with objective evaluation"]
                }
            },
            
            // --- OPERIS ARCHETYPES ---
            forgemaster: {
                quote: "I'll turn our plans into systematic, reliable action",
                teamRole: "Forgemasters are systematic implementers who transform concepts into concrete reality through disciplined execution. They naturally create structured approaches, follow through reliably, and bridge the gap between planning and results.",
                strengths: ["Converts abstract ideas into actionable plans", "Provides reliable, consistent execution", "Creates systematic approaches to complex work", "Excellent at resource planning and allocation", "Builds sustainable processes and workflows"],
                blindspots: ["May be slow to adapt plans when circumstances change", "Can become overly focused on process vs. outcomes", "Might resist creative or unconventional approaches", "Tendency to over-plan before taking action", "May struggle with ambiguous or evolving requirements"],
                impact: {
                    dos: ["Build flexibility into systematic approaches", "Regularly check that processes serve the end goal", "Involve others in refining implementation approaches"],
                    avo: ["Getting stuck in \"we've always done it this way\" thinking", "Over-engineering solutions for simple problems"]
                },
                synergy: {
                    high: ["The Innovator: Transforms creative ideas into actionable reality", "The Vanguard: Systematic approach channels drive into results", "The Commander: Implementation supports strategic coordination"],
                    low: ["The Pathfinder: Systematic plans conflict with constant adaptation", "The Advocate: Practical constraints clash with idealistic goals", "The Inspirer: Process focus conflicts with people-first energy"]
                }
            },
            finisher: {
                quote: "Let me ensure we deliver excellent, error-free results",
                teamRole: "Finishers are quality perfectionists who ensure teams deliver polished, error-free outcomes. They naturally focus on details, catch mistakes others miss, and maintain high standards throughout the work process.",
                strengths: ["Prevents costly errors and quality issues", "Maintains consistently high standards", "Excellent attention to detail and thoroughness", "Provides final quality check before delivery", "Takes pride in flawless execution"],
                blindspots: ["May get stuck perfecting details while missing deadlines", "Can become anxious about imperfection or criticism", "Might slow team down with excessive quality checks", "Tendency to be overly critical of own and others' work", "May struggle with \"good enough\" solutions when appropriate"],
                impact: {
                    dos: ["Agree on quality standards upfront with the team", "Focus perfection efforts on the most critical elements", "Teach others your quality techniques"],
                    avo: ["Perfectionism that prevents timely delivery", "Becoming the bottleneck for team progress"]
                },
                synergy: {
                    high: ["The Specialist: Quality standards align with technical expertise", "The Orchestrator: Attention to detail enhances process management", "The Guardian: Quality focus supports risk prevention"],
                    low: ["The Vanguard: Perfectionist pace conflicts with urgency to deliver", "The Innovator: Quality standards clash with creative experimentation", "The Pathfinder: Perfection conflicts with rapid exploration and adaptation"]
                }
            },
            orchestrator: {
                quote: "I'll structure our work and coordinate our complex operations",
                teamRole: "Orchestrators are process architects who create structure and manage workflow complexity. They naturally organise tasks, coordinate dependencies, and ensure smooth operational flow across team activities.",
                strengths: ["Creates order from complex, chaotic situations", "Excellent at managing multiple moving parts", "Identifies and resolves workflow bottlenecks", "Coordinates effectively across different functions", "Builds efficient systems and processes"],
                blindspots: ["May over-structure work that needs flexibility", "Can become overwhelmed managing too many details", "Might focus on process efficiency over relationship quality", "Tendency to create bureaucracy where none is needed", "May struggle when processes break down"],
                impact: {
                    dos: ["Design processes that serve the team, not the reverse", "Build in checkpoints to adjust structure as needed", "Balance efficiency with team member autonomy"],
                    avo: ["Creating rigid systems that stifle creativity", "Becoming indispensable to basic team operations"]
                },
                synergy: {
                    high: ["The Commander: Process structure supports strategic coordination", "The Finisher: Systematic approach enhances quality management", "The Specialist: Process design benefits from technical expertise"],
                    low: ["The Innovator: Systematic processes conflict with creative chaos", "The Pathfinder: Structured operations clash with constant adaptation", "The Inspirer: Process focus conflicts with relationship-first energy"]
                }
            },
            
            // --- FOEDERIS ARCHETYPES ---
            ambassador: {
                quote: "I'll build relationships and bring in external resources",
                teamRole: "Ambassadors are network builders who expand team influence and resources through external relationships. They naturally connect with people outside the team, identify opportunities, and bring back valuable insights and support.",
                strengths: ["Expands team's network and resource access", "Brings external perspectives and market intelligence", "Excellent at building rapport and trust quickly", "Identifies partnership and collaboration opportunities", "Represents team effectively to external stakeholders"],
                blindspots: ["May spend too much time on external relationships vs. internal work", "Can over-promise based on enthusiasm for opportunities", "Might lose focus jumping between different external contacts", "Tendency to be overly optimistic about external support", "May struggle with detailed follow-through on connections"],
                impact: {
                    dos: ["Focus networking efforts on team's strategic priorities", "Systematically follow up on promising connections", "Share external insights regularly with the team"],
                    avo: ["Pursuing every interesting opportunity without filtering", "Neglecting internal team relationships for external ones"]
                },
                synergy: {
                    high: ["The Commander: External relationships support strategic objectives", "The Pathfinder: Network connections reveal new opportunities", "The Analyst: External intelligence enhances objective evaluation"],
                    low: ["The Guardian: External focus conflicts with internal protection", "The Specialist: Broad networking clashes with deep expertise focus", "The Finisher: External opportunities disrupt quality completion"]
                }
            },
            inspirer: {
                quote: "I'll motivate our team and keep our energy high",
                teamRole: "Inspirers are energy catalysts who maintain team motivation and enthusiasm. They naturally uplift others, celebrate successes, provide encouragement during difficult times, and keep the team engaged and positive.",
                strengths: ["Maintains positive team energy and morale", "Excellent at recognising and celebrating achievements", "Provides emotional support during challenging periods", "Creates enthusiasm for team goals and initiatives", "Helps team members see their potential"],
                blindspots: ["May avoid addressing difficult or negative issues", "Can appear superficial when team needs serious discussion", "Might rely too heavily on motivation vs. systematic solutions", "Tendency to take team mood personally", "May struggle with consistently pessimistic team members"],
                impact: {
                    dos: ["Balance positivity with honest acknowledgment of challenges", "Tailor motivation approaches to different team members", "Channel enthusiasm toward concrete team objectives"],
                    avo: ["Toxic positivity that dismisses legitimate concerns", "Burning out from constantly supporting others"]
                },
                synergy: {
                    high: ["The Vanguard: Motivational energy channels drive into positive results", "The Advocate: Inspirational purpose enhances principled energy", "The Shepherd: Both focus on supporting team member success"],
                    low: ["The Analyst: Positive energy conflicts with critical evaluation", "The Guardian: Optimistic outlook clashes with risk focus", "The Forgemaster: People focus conflicts with process orientation"]
                }
            },
            peacekeeper: {
                quote: "I'll help us find consensus and resolve our conflicts",
                teamRole: "Peacekeepers are harmony facilitators who manage conflicts and build consensus. They naturally mediate disagreements, ensure all voices are heard, and help team members find common ground and collaborative solutions.",
                strengths: ["Prevents and resolves interpersonal conflicts", "Excellent at seeing multiple perspectives on issues", "Creates inclusive environment where everyone contributes", "Builds consensus and collaborative solutions", "Maintains team cohesion during difficult periods"],
                blindspots: ["May avoid necessary conflicts that would benefit the team", "Can be indecisive when clear choices need to be made", "Might compromise quality to maintain harmony", "Tendency to take on others' emotional burdens", "May struggle with team members who prefer direct conflict"],
                impact: {
                    dos: ["Address conflicts early before they escalate", "Help team establish healthy conflict norms", "Balance consensus-building with timely decision-making"],
                    avo: ["Avoiding all conflict even when it would be productive", "Sacrificing important outcomes for the sake of harmony"]
                },
                synergy: {
                    high: ["The Shepherd: Both prioritise team member wellbeing and harmony", "The Orchestrator: Conflict resolution enhances process coordination", "The Ambassador: Diplomacy skills support external relationship building"],
                    low: ["The Vanguard: Consensus-building conflicts with urgent action", "The Commander: Collaborative approach clashes with decisive leadership", "The Advocate: Harmony focus conflicts with principled stands"]
                }
            },
            guardian: {
                quote: "I'll protect our team from risks and threats",
                teamRole: "Guardians are risk managers who identify and protect against potential threats to team success. They naturally scan for dangers, prepare contingencies, and ensure team security and stability.",
                strengths: ["Identifies risks and threats others might miss", "Excellent at contingency planning and preparation", "Provides stability and security for team members", "Maintains vigilance about potential problems", "Creates safe environment for team to operate"],
                blindspots: ["May be overly cautious and slow down progress", "Can focus too much on problems vs. opportunities", "Might create anxiety by overemphasising risks", "Tendency to resist change due to uncertainty", "May become overprotective and limit team growth"],
                impact: {
                    dos: ["Balance risk awareness with calculated risk-taking", "Frame risks in terms of probability and impact", "Prepare contingencies without becoming paralysed"],
                    avo: ["Becoming the team's source of constant worry", "Blocking beneficial changes due to theoretical risks"]
                },
                synergy: {
                    high: ["The Analyst: Risk assessment benefits from objective evaluation", "The Finisher: Quality focus aligns with risk prevention", "The Advocate: Both protect what matters most to the team"],
                    low: ["The Pathfinder: Risk aversion conflicts with exploration and change", "The Innovator: Caution clashes with creative experimentation", "The Inspirer: Risk focus conflicts with optimistic energy"]
                }
            },
            shepherd: {
                quote: "I'll serve our team's needs and help everyone succeed",
                teamRole: "Shepherds are service-oriented supporters who nurture team success through dedicated care and assistance. They naturally put team needs first, provide practical support, and ensure no team member is left behind.",
                strengths: ["Provides practical support when team members struggle", "Maintains team culture and shared values", "Excellent at anticipating and meeting team needs", "Creates sense of belonging and psychological safety", "Demonstrates loyalty and commitment to team success"],
                blindspots: ["May neglect own needs while serving others", "Can enable poor performance by being too supportive", "Might avoid giving difficult feedback to maintain relationships", "Tendency to take on too much responsibility for others", "May struggle with setting appropriate boundaries"],
                impact: {
                    dos: ["Balance support with accountability for performance", "Help team members develop independence", "Take care of your own needs to avoid burnout"],
                    avo: ["Enabling dependency rather than building capability", "Sacrificing team results for individual comfort"]
                },
                synergy: {
                    high: ["The Peacekeeper: Both prioritise team harmony and member wellbeing", "The Inspirer: Service orientation enhances motivational support", "The Advocate: Both care deeply about serving others' success"],
                    low: ["The Vanguard: People-first focus conflicts with task-driven urgency", "The Analyst: Support orientation clashes with objective criticism", "The Commander: Service focus conflicts with directive leadership"]
                }
            }
        }
    };

    // Note: Phase 1, 2, and 3 question arrays are omitted for brevity but should be included as before.

    await kv.set('ari-v2-question-bank', questionBank);
    console.log("Database seeded successfully with archetype profiles!");
}

seedDatabase();