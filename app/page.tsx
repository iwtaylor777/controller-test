"use client";

import { useMemo, useState } from "react";

type DimensionKey =
  | "control"
  | "feedback"
  | "tempo"
  | "simulation"
  | "data"
  | "diversity"
  | "value";

type Answers = Record<DimensionKey, number>;

type Preset = {
  name: string;
  category: "Games" | "Simulation" | "Robotics";
  description: string;
  values: Answers;
};

const questions: {
  key: DimensionKey;
  index: string;
  title: string;
  detail: string;
  low: string;
  high: string;
  weight: number;
}[] = [
  {
    key: "control",
    index: "01",
    title: "Can the task be expressed as a bounded action space?",
    detail: "Think controller, keyboard, discrete commands, or a stable set of physical actions.",
    low: "Ambiguous",
    high: "Controller-like",
    weight: 20,
  },
  {
    key: "feedback",
    index: "02",
    title: "Does each action produce observable feedback?",
    detail: "A model learns faster when consequences appear clearly in the next state.",
    low: "Delayed / hidden",
    high: "Immediate / visible",
    weight: 15,
  },
  {
    key: "tempo",
    index: "03",
    title: "How much does timing and sequence matter?",
    detail: "Action models are most distinctive when what happens next depends on acting now.",
    low: "Mostly offline",
    high: "Real-time loop",
    weight: 15,
  },
  {
    key: "simulation",
    index: "04",
    title: "Can simulation make mistakes cheap?",
    detail: "Useful virtual training grounds expand exploration without paying the full cost of failure.",
    low: "Reality only",
    high: "Simulation-rich",
    weight: 15,
  },
  {
    key: "data",
    index: "05",
    title: "Is action-labeled behavior available?",
    detail: "Inputs paired with outcomes create a stronger learning signal than passive video alone.",
    low: "Little or none",
    high: "Rich traces",
    weight: 15,
  },
  {
    key: "diversity",
    index: "06",
    title: "Must the policy work across varied environments?",
    detail: "A high score favors tasks where generalization matters more than memorizing one scene.",
    low: "One fixed scene",
    high: "Many environments",
    weight: 10,
  },
  {
    key: "value",
    index: "07",
    title: "Is better action economically or strategically meaningful?",
    detail: "The strongest pilots connect model performance to a decision someone values.",
    low: "Marginal gain",
    high: "Material outcome",
    weight: 10,
  },
];

const presets: Preset[] = [
  {
    name: "Warehouse inventory patrol",
    category: "Robotics",
    description: "Navigate aisles, identify stock conditions, and adapt to changing obstacles.",
    values: { control: 5, feedback: 5, tempo: 4, simulation: 4, data: 3, diversity: 4, value: 4 },
  },
  {
    name: "Adaptive game teammate",
    category: "Games",
    description: "Collaborate with human players while responding to novel tactics in real time.",
    values: { control: 5, feedback: 5, tempo: 5, simulation: 5, data: 5, diversity: 4, value: 3 },
  },
  {
    name: "Hazardous-site inspection",
    category: "Robotics",
    description: "Explore unfamiliar industrial spaces and surface anomalies without risking people.",
    values: { control: 4, feedback: 4, tempo: 4, simulation: 4, data: 2, diversity: 5, value: 5 },
  },
  {
    name: "Factory digital-twin operator",
    category: "Simulation",
    description: "Test action policies against changing layouts, traffic, and process constraints.",
    values: { control: 4, feedback: 5, tempo: 4, simulation: 5, data: 3, diversity: 4, value: 5 },
  },
  {
    name: "Robotic object picking",
    category: "Robotics",
    description: "Select, grasp, and place unfamiliar objects under changing visual conditions.",
    values: { control: 4, feedback: 5, tempo: 4, simulation: 4, data: 3, diversity: 5, value: 4 },
  },
  {
    name: "Branching training scenario",
    category: "Simulation",
    description: "Generate responsive practice environments that react to a learner's decisions.",
    values: { control: 3, feedback: 4, tempo: 3, simulation: 5, data: 3, diversity: 4, value: 3 },
  },
];

const initialPreset = presets[0];

function calculateScore(values: Answers) {
  return Math.round(
    questions.reduce(
      (total, question) =>
        total + ((values[question.key] - 1) / 4) * question.weight,
      0,
    ),
  );
}

function getVerdict(score: number) {
  if (score >= 80) {
    return {
      label: "Strong pilot candidate",
      note: "The action loop is unusually legible. Scope a real test around one measurable behavior.",
    };
  }
  if (score >= 65) {
    return {
      label: "Promising with constraints",
      note: "The fit is credible. A pilot should isolate the weakest learning signal before expanding.",
    };
  }
  if (score >= 45) {
    return {
      label: "Targeted experiment",
      note: "A focused experiment can resolve the main uncertainty before the scope expands.",
    };
  }
  return {
    label: "Foundation work first",
    note: "Clarify the action space, feedback loop, or available data before investing in a pilot.",
  };
}

function getPilotBrief(
  name: string,
  category: string,
  score: number,
  values: Answers,
) {
  const safeName = name.trim() || "This use case";
  const dataPlan =
    values.data >= 4
      ? "Sample and normalize existing action traces; preserve state, input, timing, and outcome."
      : "Instrument a small expert-data collection run that pairs observations with exact actions and outcomes.";
  const environmentPlan =
    category === "Robotics"
      ? "Build a bounded simulation and reserve one physical environment for transfer validation."
      : category === "Games"
        ? "Use a bounded playable environment with human baselines and deliberately varied scenarios."
        : "Define a controllable simulator with repeatable scenarios and held-out environment changes.";
  const risk =
    values.feedback <= 2
      ? "Make success observable; weak or delayed feedback is the primary gating risk."
      : values.control <= 2
        ? "Constrain the action vocabulary; an ambiguous control surface is the primary gating risk."
        : values.data <= 2
          ? "Prove a viable action-data collection path before scaling model work."
          : "Measure generalization directly in a held-out environment.";

  return [
    "Six-week pilot brief",
    "",
    "Use case: " + safeName,
    "Domain: " + category,
    "Readiness signal: " + score + "/100 — " + getVerdict(score).label,
    "",
    "Hypothesis",
    "An action model can improve a bounded version of " + safeName.toLowerCase() + " by learning the relationship between observation, action, and consequence.",
    "",
    "Weeks 1–2 · Instrument",
    dataPlan,
    environmentPlan,
    "",
    "Weeks 3–4 · Establish the learning signal",
    "Train or adapt against one primary behavior. Compare with a scripted or human baseline. Hold back at least one environment variation.",
    "",
    "Weeks 5–6 · Stress-test and decide",
    "Measure task completion, intervention rate, action latency, and performance in the held-out environment. Document failure modes alongside the headline result.",
    "",
    "Primary gating question",
    risk,
    "",
    "Go / no-go rule",
    "Advance when the model beats the baseline on the primary behavior and retains useful performance under the held-out variation.",
  ].join("\n");
}

export default function Home() {
  const [name, setName] = useState(initialPreset.name);
  const [category, setCategory] = useState(initialPreset.category);
  const [answers, setAnswers] = useState<Answers>(initialPreset.values);
  const [copied, setCopied] = useState(false);

  const score = useMemo(() => calculateScore(answers), [answers]);
  const verdict = useMemo(() => getVerdict(score), [score]);
  const weakest = useMemo(
    () =>
      [...questions].sort(
        (a, b) => answers[a.key] - answers[b.key],
      )[0],
    [answers],
  );
  const brief = useMemo(
    () => getPilotBrief(name, category, score, answers),
    [name, category, score, answers],
  );

  const updateAnswer = (key: DimensionKey, value: number) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const loadPreset = (preset: Preset) => {
    setName(preset.name);
    setCategory(preset.category);
    setAnswers(preset.values);
    setCopied(false);
    document.getElementById("test")?.scrollIntoView({ behavior: "smooth" });
  };

  const copyBrief = async () => {
    await navigator.clipboard.writeText(brief);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <main>
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="The Controller Test, home">
          <span className="wordmark-mark" aria-hidden="true">↗</span>
          controller test
        </a>
        <span className="issue">A screen for action-model opportunities</span>
        <nav aria-label="Main navigation">
          <a href="#method">Why + method</a>
          <a href="#atlas">Examples</a>
          <a href="#sources">Sources</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="action-field" aria-hidden="true">
          <div className="field-frame frame-observe">
            <span>observation</span>
            <div className="frame-content"><i /><i /><i /></div>
          </div>
          <div className="field-frame frame-decide">
            <span>policy</span>
            <div className="decision-cross"><i /><i /></div>
          </div>
          <div className="field-frame frame-act">
            <span>next state</span>
            <div className="frame-content shifted"><i /><i /><i /></div>
          </div>
          <div className="field-connector connector-one"><i /></div>
          <div className="field-connector connector-two"><i /></div>
          <p className="field-equation">state t <b>→</b> action <b>→</b> state t+1</p>
        </div>
        <div className="hero-brand" aria-hidden="true">
          <span>↗</span>
          <strong>controller test</strong>
        </div>
        <div className="hero-panel">
          <div className="hero-panel-copy">
            <p className="hero-context">
              Independent proposal: a way for General Intuition to qualify early
              use cases, structure partner conversations, and turn promising
              ideas into measurable pilots.
            </p>
            <h1>Which problems belong to action models?</h1>
            <p>
              Seven questions for finding tasks with legible actions, measurable
              consequences, and enough variation to reward a learned policy.
            </p>
          </div>
          <div className="hero-panel-actions">
            <a className="hero-primary-link" href="#test">Start the assessment <span>↓</span></a>
            <a className="hero-method-link" href="#method">Why this framework<br />and how it works <span>→</span></a>
          </div>
        </div>
      </section>

      <section className="thesis-strip" aria-label="Core thesis">
        <p>Actions you can name</p>
        <p>Consequences you can measure</p>
        <p>Variation the policy must survive</p>
      </section>

      <section className="test-section" id="test">
        <div className="section-intro">
          <p className="section-index">1 / assess</p>
          <h2>Describe the task and move the seven signals.</h2>
          <p>
            The readout helps prioritize early commercial discovery. Each input
            should come from a real constraint, observation, or customer
            conversation.
          </p>
        </div>

        <div className="test-workspace">
          <form className="questionnaire" onSubmit={(event) => event.preventDefault()}>
            <div className="identity-fields">
              <label>
                <span>Use case</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Warehouse inventory patrol"
                />
              </label>
              <label>
                <span>Domain</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option>Games</option>
                  <option>Simulation</option>
                  <option>Robotics</option>
                  <option>Other</option>
                </select>
              </label>
            </div>

            {questions.map((question) => (
              <fieldset className="question" key={question.key}>
                <legend>
                  <span>{question.index}</span>
                  <strong>{question.title}</strong>
                </legend>
                <p>{question.detail}</p>
                <div className="range-row">
                  <span>{question.low}</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={answers[question.key]}
                    aria-label={question.title}
                    onChange={(event) =>
                      updateAnswer(question.key, Number(event.target.value))
                    }
                    style={{ "--range-position": ((answers[question.key] - 1) / 4) * 100 + "%" } as React.CSSProperties}
                  />
                  <span>{question.high}</span>
                  <output aria-live="polite">{answers[question.key]}/5</output>
                </div>
              </fieldset>
            ))}
          </form>

          <aside className="result-panel" aria-live="polite">
            <p className="panel-kicker">Readiness</p>
            <h3>{name || "Untitled use case"}</h3>
            <div className="score-lockup">
              <strong>{score}</strong><span>/100</span>
            </div>
            <div className="score-track" aria-label={"Readiness score " + score + " out of 100"}>
              <span style={{ width: score + "%" }} />
            </div>
            <div className="score-scale"><span>Foundation</span><span>Experiment</span><span>Pilot</span></div>
            <div className="verdict">
              <span className="status-dot" />
              <div><strong>{verdict.label}</strong><p>{verdict.note}</p></div>
            </div>
            <div className="next-signal">
              <span>First question to resolve</span>
              <strong>{weakest.title}</strong>
              <small>Current input: {answers[weakest.key]}/5 · weight {weakest.weight}%</small>
            </div>
            <a className="button button-accent" href="#brief">Build the pilot brief <span>↓</span></a>
          </aside>
        </div>
      </section>

      <section className="brief-section" id="brief">
        <div className="section-intro inverted">
          <p className="section-index">2 / pilot brief</p>
          <h2>Turn the readout into a learning plan.</h2>
          <p>
            The generated brief defines the hypothesis, the first data work,
            the held-out test, and the decision rule for week six.
          </p>
        </div>
        <article className="brief-paper">
          <header>
            <div><span>Pilot ID</span><strong>ACT-{String(score).padStart(3, "0")}</strong></div>
            <div><span>Domain</span><strong>{category}</strong></div>
            <div><span>Readiness</span><strong>{score}/100</strong></div>
          </header>
          <h3>{name || "Untitled use case"}</h3>
          <div className="brief-grid">
            <div>
              <span>Hypothesis</span>
              <p>
                An action model can improve a bounded version of {(name || "this use case").toLowerCase()} by
                learning the relationship between observation, action, and consequence.
              </p>
            </div>
            <div>
              <span>Primary gate</span>
              <p>{brief.split("Primary gating question\n")[1]?.split("\n\n")[0]}</p>
            </div>
            <div>
              <span>Weeks 1–2 · Instrument</span>
              <p>Define one behavior, pair observations with exact actions, and reserve an environment variation for validation.</p>
            </div>
            <div>
              <span>Weeks 3–4 · Learn</span>
              <p>Adapt against the primary behavior and compare performance with a scripted or human baseline.</p>
            </div>
            <div>
              <span>Weeks 5–6 · Stress-test</span>
              <p>Measure completion, intervention, latency, and performance in the held-out environment.</p>
            </div>
            <div>
              <span>Decision rule</span>
              <p>Advance when the model beats the baseline and retains useful performance under variation.</p>
            </div>
          </div>
          <button className="button button-dark copy-button" type="button" onClick={copyBrief}>
            {copied ? "Copied to clipboard ✓" : "Copy the full pilot brief"} 
          </button>
        </article>
      </section>

      <section className="atlas-section" id="atlas">
        <div className="atlas-heading">
          <div>
            <p className="section-index">3 / examples</p>
            <h2>Six places to test the framework.</h2>
          </div>
          <p>
            These examples are working hypotheses built from public information.
            Select one to see how its assumptions change the readout.
          </p>
        </div>
        <div className="atlas-grid">
          {presets.map((preset, index) => {
            const presetScore = calculateScore(preset.values);
            return (
              <button className="atlas-case" key={preset.name} type="button" onClick={() => loadPreset(preset)}>
                <span className="case-number">0{index + 1}</span>
                <span className="case-category">{preset.category}</span>
                <strong>{preset.name}</strong>
                <p>{preset.description}</p>
                <span className="case-score"><b>{presetScore}</b>/100 <i>Run this case ↗</i></span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="method-section" id="method">
        <div>
          <p className="section-index">4 / scoring</p>
          <h2>How the score works.</h2>
        </div>
        <div className="method-copy">
          <p>
            The Controller Test combines seven legible dimensions into an early
            readiness signal. Model performance, integration cost, safety and
            commercial value still require direct technical and customer work.
          </p>
          <p>
            A high score suggests that the observation–action–consequence loop
            is clear enough to design a tightly scoped learning partnership.
          </p>
          <div className="formula">
            <span>Readiness</span>
            <b>=</b>
            <span>control × 20%</span>
            <b>+</b>
            <span>feedback × 15%</span>
            <b>+</b>
            <span>tempo × 15%</span>
            <b>+</b>
            <span>simulation × 15%</span>
            <b>+</b>
            <span>data × 15%</span>
            <b>+</b>
            <span>diversity × 10%</span>
            <b>+</b>
            <span>value × 10%</span>
          </div>
        </div>
      </section>

      <section className="sources-section" id="sources">
        <p className="section-index">5 / public sources</p>
        <div>
          <p>
            The framing draws from General Intuition’s public descriptions of
            action models, world models, gameplay data, MIRA, and early
            partnerships. The scoring framework and opportunity hypotheses are
            independent analysis.
          </p>
          <a href="https://www.generalintuition.com/" target="_blank" rel="noreferrer">
            General Intuition — company and research overview ↗
          </a>
          <a href="https://techcrunch.com/2026/06/25/from-fortnite-to-robots-general-intuitions-2-3b-bet-that-video-games-can-train-ai-agents-for-the-real-world/" target="_blank" rel="noreferrer">
            TechCrunch — from gameplay to real-world agents ↗
          </a>
        </div>
      </section>

      <footer>
        <p>
          Independent proof of work based on public information.<br />
          No affiliation with or endorsement by General Intuition.
        </p>
        <a href="#top">Return to top ↑</a>
        <p className="footer-mark">THE CONTROLLER TEST / 2026</p>
      </footer>
    </main>
  );
}
