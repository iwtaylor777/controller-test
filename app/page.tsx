"use client";

import { useMemo, useState, type CSSProperties } from "react";

type SignalKey =
  | "actionSpace"
  | "causalFeedback"
  | "temporalDependence"
  | "environmentVariation"
  | "actionData"
  | "simulationLeverage"
  | "evaluationBaseline"
  | "strategicValue";

type GateKey = "dataRights" | "measurableOutcome" | "boundedFailure";
type Domain = "Games" | "Simulation" | "Robotics" | "Other";
type EvidenceLevel = "Hypothesis" | "Partner-confirmed" | "Measured";
type SignalValues = Record<SignalKey, number>;
type GateValues = Record<GateKey, boolean>;

type Candidate = {
  id: string;
  name: string;
  partner: string;
  domain: Domain;
  behavior: string;
  metric: string;
  evidence: EvidenceLevel;
  signals: SignalValues;
  gates: GateValues;
};

type SignalDefinition = {
  key: SignalKey;
  index: string;
  group: "Model fit" | "Pilotability";
  title: string;
  detail: string;
  low: string;
  high: string;
  weight: number;
};

const signals: SignalDefinition[] = [
  {
    key: "actionSpace",
    index: "01",
    group: "Model fit",
    title: "Can the behavior be represented by a stable action vocabulary?",
    detail: "Look for controller inputs, robot commands, tool calls, or another bounded interface.",
    low: "Ambiguous",
    high: "Well specified",
    weight: 30,
  },
  {
    key: "causalFeedback",
    index: "02",
    group: "Model fit",
    title: "Are the consequences of an action visible in the next state?",
    detail: "The learning signal is strongest when action and consequence can be attributed cleanly.",
    low: "Delayed / hidden",
    high: "Observable",
    weight: 25,
  },
  {
    key: "temporalDependence",
    index: "03",
    group: "Model fit",
    title: "Does performance depend on timing, sequence, or interaction?",
    detail: "Favor tasks where acting now changes what becomes possible next.",
    low: "Mostly offline",
    high: "Closed loop",
    weight: 20,
  },
  {
    key: "environmentVariation",
    index: "04",
    group: "Model fit",
    title: "Must the policy generalize across meaningful variation?",
    detail: "The opportunity is stronger when memorizing one scene or script is not enough.",
    low: "Fixed setting",
    high: "Many conditions",
    weight: 25,
  },
  {
    key: "actionData",
    index: "05",
    group: "Pilotability",
    title: "Can observations be paired with exact actions and outcomes?",
    detail: "Include available traces and data that could be instrumented during a focused collection run.",
    low: "No clear path",
    high: "Rich traces",
    weight: 30,
  },
  {
    key: "simulationLeverage",
    index: "06",
    group: "Pilotability",
    title: "Can exploration or evaluation happen cheaply and safely?",
    detail: "Games, simulators, digital twins, and bounded test environments improve iteration speed.",
    low: "Reality only",
    high: "Safe sandbox",
    weight: 25,
  },
  {
    key: "evaluationBaseline",
    index: "07",
    group: "Pilotability",
    title: "Is there a repeatable baseline and held-out test?",
    detail: "A pilot needs a comparison point, a validation environment, and a decision rule.",
    low: "Subjective",
    high: "Repeatable",
    weight: 20,
  },
  {
    key: "strategicValue",
    index: "08",
    group: "Pilotability",
    title: "Would better performance matter to a real operator or business?",
    detail: "Connect model improvement to time, cost, risk, quality, or a strategic capability.",
    low: "Nice to have",
    high: "Material",
    weight: 25,
  },
];

const gateDefinitions: { key: GateKey; title: string; detail: string }[] = [
  {
    key: "dataRights",
    title: "Usable data path",
    detail: "The required data can be collected or used with appropriate rights and consent.",
  },
  {
    key: "measurableOutcome",
    title: "Measurable outcome",
    detail: "The team can define a metric and compare performance with a baseline.",
  },
  {
    key: "boundedFailure",
    title: "Bounded pilot risk",
    detail: "Failures can be contained in simulation, a sandbox, or a supervised operating envelope.",
  },
];

const presets: Candidate[] = [
  {
    id: "game-qa",
    name: "Autonomous game QA",
    partner: "Game studio",
    domain: "Games",
    behavior: "Explore a changing game build, execute critical paths, and reproduce high-value failures.",
    metric: "Critical-path coverage per test hour",
    evidence: "Partner-confirmed",
    signals: {
      actionSpace: 4,
      causalFeedback: 5,
      temporalDependence: 4,
      environmentVariation: 5,
      actionData: 5,
      simulationLeverage: 5,
      evaluationBaseline: 5,
      strategicValue: 4,
    },
    gates: { dataRights: true, measurableOutcome: true, boundedFailure: true },
  },
  {
    id: "warehouse",
    name: "Warehouse exception recovery",
    partner: "Logistics operator",
    domain: "Robotics",
    behavior: "Recover from blocked aisles, misplaced inventory, and other exceptions during autonomous patrol.",
    metric: "Exceptions resolved without human intervention",
    evidence: "Hypothesis",
    signals: {
      actionSpace: 4,
      causalFeedback: 4,
      temporalDependence: 4,
      environmentVariation: 5,
      actionData: 2,
      simulationLeverage: 3,
      evaluationBaseline: 4,
      strategicValue: 5,
    },
    gates: { dataRights: true, measurableOutcome: true, boundedFailure: true },
  },
  {
    id: "digital-twin",
    name: "Factory digital-twin operator",
    partner: "Industrial simulation team",
    domain: "Simulation",
    behavior: "Choose operating actions as layouts, traffic, and process constraints change.",
    metric: "Throughput gain under held-out scenarios",
    evidence: "Partner-confirmed",
    signals: {
      actionSpace: 4,
      causalFeedback: 5,
      temporalDependence: 4,
      environmentVariation: 4,
      actionData: 3,
      simulationLeverage: 5,
      evaluationBaseline: 4,
      strategicValue: 5,
    },
    gates: { dataRights: true, measurableOutcome: true, boundedFailure: true },
  },
  {
    id: "object-picking",
    name: "Robotic object picking",
    partner: "Robotics platform",
    domain: "Robotics",
    behavior: "Select, grasp, and place unfamiliar objects under changing visual and physical conditions.",
    metric: "Successful picks per intervention",
    evidence: "Measured",
    signals: {
      actionSpace: 4,
      causalFeedback: 5,
      temporalDependence: 4,
      environmentVariation: 5,
      actionData: 3,
      simulationLeverage: 4,
      evaluationBaseline: 5,
      strategicValue: 4,
    },
    gates: { dataRights: true, measurableOutcome: true, boundedFailure: true },
  },
  {
    id: "multiplayer-agent",
    name: "Adaptive multiplayer teammate",
    partner: "Online game team",
    domain: "Games",
    behavior: "Coordinate with human players while responding to novel tactics in real time.",
    metric: "Team objective completion versus scripted agent",
    evidence: "Hypothesis",
    signals: {
      actionSpace: 5,
      causalFeedback: 5,
      temporalDependence: 5,
      environmentVariation: 4,
      actionData: 5,
      simulationLeverage: 5,
      evaluationBaseline: 4,
      strategicValue: 3,
    },
    gates: { dataRights: false, measurableOutcome: true, boundedFailure: true },
  },
];

const initialCandidate = presets[0];

function calculateGroupScore(values: SignalValues, group: SignalDefinition["group"]) {
  const groupSignals = signals.filter((signal) => signal.group === group);
  const weightTotal = groupSignals.reduce((total, signal) => total + signal.weight, 0);
  const weighted = groupSignals.reduce(
    (total, signal) => total + ((values[signal.key] - 1) / 4) * signal.weight,
    0,
  );
  return Math.round((weighted / weightTotal) * 100);
}

function getScores(values: SignalValues) {
  const fit = calculateGroupScore(values, "Model fit");
  const pilotability = calculateGroupScore(values, "Pilotability");
  return {
    fit,
    pilotability,
    priority: Math.round(fit * 0.55 + pilotability * 0.45),
  };
}

function getDecision(values: SignalValues, gates: GateValues) {
  const scores = getScores(values);
  const openGates = gateDefinitions.filter((gate) => !gates[gate.key]);

  if (openGates.length > 0) {
    return {
      label: "Resolve a hard gate",
      code: "HOLD",
      rank: 1,
      note: "The opportunity may fit the model, but it is not ready for pilot design.",
    };
  }
  if (scores.fit >= 75 && scores.pilotability >= 70) {
    return {
      label: "Advance to a scoped pilot",
      code: "ADVANCE",
      rank: 4,
      note: "The learning loop is legible and the operating conditions support a bounded test.",
    };
  }
  if (scores.fit >= 65 && scores.pilotability >= 50) {
    return {
      label: "Run a discovery sprint",
      code: "DISCOVER",
      rank: 3,
      note: "The model fit is credible. Resolve the largest pilotability uncertainty next.",
    };
  }
  if (scores.fit >= 50) {
    return {
      label: "Run a targeted experiment",
      code: "EXPERIMENT",
      rank: 2,
      note: "Test one uncertain learning signal before committing to a partner pilot.",
    };
  }
  return {
    label: "Do not prioritize yet",
    code: "PARK",
    rank: 0,
    note: "The action loop needs sharper definition before further investment.",
  };
}

function getWeakestSignal(values: SignalValues) {
  return [...signals].sort((a, b) => {
    const aWeighted = values[a.key] * a.weight;
    const bWeighted = values[b.key] * b.weight;
    return aWeighted - bWeighted;
  })[0];
}

function getConfidence(evidence: EvidenceLevel) {
  if (evidence === "Measured") return { label: "High", note: "Grounded in observed operating data." };
  if (evidence === "Partner-confirmed") return { label: "Medium", note: "Grounded in a partner or operator conversation." };
  return { label: "Low", note: "Treat the readout as a hypothesis to validate." };
}

function buildPilotBrief(candidate: Candidate) {
  const scores = getScores(candidate.signals);
  const decision = getDecision(candidate.signals, candidate.gates);
  const weakest = getWeakestSignal(candidate.signals);
  const openGates = gateDefinitions.filter((gate) => !candidate.gates[gate.key]);
  const gateLine =
    openGates.length > 0
      ? openGates.map((gate) => gate.title).join(", ")
      : "All three pilot gates are currently satisfied.";

  return [
    "ACTION OPPORTUNITY MEMO",
    "",
    "Opportunity: " + candidate.name,
    "Partner / team: " + candidate.partner,
    "Domain: " + candidate.domain,
    "Evidence: " + candidate.evidence,
    "Decision: " + decision.label,
    "Model fit: " + scores.fit + "/100",
    "Pilotability: " + scores.pilotability + "/100",
    "",
    "TARGET BEHAVIOR",
    candidate.behavior,
    "",
    "SUCCESS SIGNAL",
    candidate.metric,
    "",
    "PRIMARY UNCERTAINTY",
    weakest.title,
    "",
    "HARD GATES",
    gateLine,
    "",
    "WEEKS 1–2 · INSTRUMENT AND BASELINE",
    "Specify the action interface, align observations with actions and outcomes, establish the current baseline for " + candidate.metric.toLowerCase() + ", and reserve a held-out condition.",
    "",
    "WEEKS 3–4 · ESTABLISH THE LEARNING SIGNAL",
    "Adapt against one bounded behavior. Compare with the baseline, inspect action following, and document failure modes rather than relying on visual quality alone.",
    "",
    "WEEKS 5–6 · STRESS-TEST AND DECIDE",
    "Evaluate under held-out variation. Measure " + candidate.metric.toLowerCase() + ", intervention rate, latency, and boundary violations.",
    "",
    "DECISION RULE",
    "Advance only if the model improves the primary success signal, follows intended actions, and remains inside the agreed pilot boundary under held-out variation.",
  ].join("\n");
}

export default function Home() {
  const [name, setName] = useState(initialCandidate.name);
  const [partner, setPartner] = useState(initialCandidate.partner);
  const [domain, setDomain] = useState<Domain>(initialCandidate.domain);
  const [behavior, setBehavior] = useState(initialCandidate.behavior);
  const [metric, setMetric] = useState(initialCandidate.metric);
  const [evidence, setEvidence] = useState<EvidenceLevel>(initialCandidate.evidence);
  const [signalValues, setSignalValues] = useState<SignalValues>(initialCandidate.signals);
  const [gateValues, setGateValues] = useState<GateValues>(initialCandidate.gates);
  const [shortlist, setShortlist] = useState<Candidate[]>(presets.slice(0, 3));
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentCandidate = useMemo<Candidate>(
    () => ({
      id: "current",
      name: name.trim() || "Untitled opportunity",
      partner: partner.trim() || "Unassigned",
      domain,
      behavior: behavior.trim() || "Target behavior not yet defined.",
      metric: metric.trim() || "Success metric not yet defined.",
      evidence,
      signals: signalValues,
      gates: gateValues,
    }),
    [name, partner, domain, behavior, metric, evidence, signalValues, gateValues],
  );

  const scores = useMemo(() => getScores(signalValues), [signalValues]);
  const decision = useMemo(() => getDecision(signalValues, gateValues), [signalValues, gateValues]);
  const weakest = useMemo(() => getWeakestSignal(signalValues), [signalValues]);
  const confidence = useMemo(() => getConfidence(evidence), [evidence]);
  const openGates = useMemo(
    () => gateDefinitions.filter((gate) => !gateValues[gate.key]),
    [gateValues],
  );
  const brief = useMemo(() => buildPilotBrief(currentCandidate), [currentCandidate]);
  const comparisonRows = useMemo(
    () =>
      [...shortlist].sort((a, b) => {
        const aDecision = getDecision(a.signals, a.gates);
        const bDecision = getDecision(b.signals, b.gates);
        if (aDecision.rank !== bDecision.rank) return bDecision.rank - aDecision.rank;
        return getScores(b.signals).priority - getScores(a.signals).priority;
      }),
    [shortlist],
  );

  const updateSignal = (key: SignalKey, value: number) => {
    setSignalValues((current) => ({ ...current, [key]: value }));
    setCopied(false);
    setSaved(false);
  };

  const updateGate = (key: GateKey, checked: boolean) => {
    setGateValues((current) => ({ ...current, [key]: checked }));
    setCopied(false);
    setSaved(false);
  };

  const loadCandidate = (candidate: Candidate) => {
    setName(candidate.name);
    setPartner(candidate.partner);
    setDomain(candidate.domain);
    setBehavior(candidate.behavior);
    setMetric(candidate.metric);
    setEvidence(candidate.evidence);
    setSignalValues(candidate.signals);
    setGateValues(candidate.gates);
    setSaved(false);
    setCopied(false);
    document.getElementById("screen")?.scrollIntoView({ behavior: "smooth" });
  };

  const addToShortlist = () => {
    setShortlist((current) => [
      { ...currentCandidate },
      ...current.filter(
        (candidate) =>
          candidate.id !== "current" &&
          candidate.name.toLowerCase() !== currentCandidate.name.toLowerCase(),
      ),
    ].slice(0, 6));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const copyBrief = async () => {
    await navigator.clipboard.writeText(brief);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <main>
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="Controller Test, home">
          <span aria-hidden="true">↗</span>
          controller test
        </a>
        <span className="masthead-note">Action opportunity screen / v2.0</span>
        <nav aria-label="Main navigation">
          <a href="#screen">Screen</a>
          <a href="#compare">Compare</a>
          <a href="#pilot">Pilot memo</a>
          <a href="#method">Method</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Partner discovery → pilot decision</p>
          <h1>Find the action-model wedge.</h1>
          <p className="hero-deck">
            A decision aid for qualifying opportunities across games, simulation,
            and robotics—then turning the strongest candidate into a measurable
            six-week learning plan.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#screen">Screen an opportunity <span>↓</span></a>
            <a href="#method">Read the decision logic <span>→</span></a>
          </div>
        </div>

        <aside className="hero-readout" aria-label="Current opportunity summary">
          <div className="readout-head">
            <span>Current case</span>
            <b>{decision.code}</b>
          </div>
          <h2>{name || "Untitled opportunity"}</h2>
          <div className="readout-scores">
            <div><span>Model fit</span><strong>{scores.fit}</strong><small>/100</small></div>
            <div><span>Pilotability</span><strong>{scores.pilotability}</strong><small>/100</small></div>
          </div>
          <div className="readout-line">
            <span>Evidence</span><strong>{confidence.label} confidence</strong>
          </div>
          <div className="readout-line">
            <span>Gates</span><strong>{3 - openGates.length}/3 closed</strong>
          </div>
          <p>{decision.label}</p>
        </aside>

        <div className="hero-loop" aria-hidden="true">
          <span>observation</span><b>→</b><span>action</span><b>→</b><span>consequence</span><b>→</b><span>next state</span>
        </div>
      </section>

      <section className="product-strip" aria-label="Workflow">
        <div><span>01</span><strong>Frame</strong><p>Name the behavior and business signal.</p></div>
        <div><span>02</span><strong>Screen</strong><p>Separate model fit from pilotability.</p></div>
        <div><span>03</span><strong>Compare</strong><p>Prioritize candidates with the same logic.</p></div>
        <div><span>04</span><strong>Decide</strong><p>Leave with a bounded learning plan.</p></div>
      </section>

      <section className="screen-section" id="screen">
        <div className="section-rail">
          <p className="section-index">01 / opportunity screen</p>
          <h2>Turn a broad idea into a decision.</h2>
          <p>
            Use evidence from an operator, partner, or measured workflow.
            Precision without evidence is not confidence.
          </p>
          <div className="rail-note">
            <span>Decision output</span>
            <p>Advance, discover, experiment, hold, or park.</p>
          </div>
        </div>

        <div className="screen-content">
          <div className="screen-workspace">
            <form className="assessment" onSubmit={(event) => event.preventDefault()}>
              <div className="form-heading">
                <span>A / frame the opportunity</span>
                <p>Start with one behavior—not an industry, platform, or broad ambition.</p>
              </div>

              <div className="intake-grid">
                <label>
                  <span>Opportunity</span>
                  <input value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} />
                </label>
                <label>
                  <span>Partner / team</span>
                  <input value={partner} onChange={(event) => { setPartner(event.target.value); setSaved(false); }} />
                </label>
                <label>
                  <span>Domain</span>
                  <select value={domain} onChange={(event) => setDomain(event.target.value as Domain)}>
                    <option>Games</option>
                    <option>Simulation</option>
                    <option>Robotics</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>
                  <span>Evidence level</span>
                  <select value={evidence} onChange={(event) => setEvidence(event.target.value as EvidenceLevel)}>
                    <option>Hypothesis</option>
                    <option>Partner-confirmed</option>
                    <option>Measured</option>
                  </select>
                </label>
                <label className="wide-field">
                  <span>Target behavior</span>
                  <textarea value={behavior} rows={2} onChange={(event) => setBehavior(event.target.value)} />
                </label>
                <label className="wide-field">
                  <span>Primary success signal</span>
                  <input value={metric} onChange={(event) => setMetric(event.target.value)} />
                </label>
              </div>

              {(["Model fit", "Pilotability"] as const).map((group, groupIndex) => (
                <div className="signal-group" key={group}>
                  <div className="form-heading">
                    <span>{groupIndex === 0 ? "B" : "C"} / {group.toLowerCase()}</span>
                    <p>
                      {group === "Model fit"
                        ? "Does the task reward a model that can perceive, predict, and act over time?"
                        : "Can a partner team create a fast, measurable, and bounded learning loop?"}
                    </p>
                  </div>
                  {signals.filter((signal) => signal.group === group).map((signal) => (
                    <fieldset className="signal" key={signal.key}>
                      <legend>
                        <span>{signal.index}</span>
                        <strong>{signal.title}</strong>
                      </legend>
                      <p>{signal.detail}</p>
                      <div className="range-row">
                        <span>{signal.low}</span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={signalValues[signal.key]}
                          aria-label={signal.title}
                          onChange={(event) => updateSignal(signal.key, Number(event.target.value))}
                          style={{ "--range-position": ((signalValues[signal.key] - 1) / 4) * 100 + "%" } as CSSProperties}
                        />
                        <span>{signal.high}</span>
                        <output>{signalValues[signal.key]}/5</output>
                      </div>
                    </fieldset>
                  ))}
                </div>
              ))}

              <div className="gate-group">
                <div className="form-heading">
                  <span>D / hard gates</span>
                  <p>A strong score cannot compensate for a blocked operating condition.</p>
                </div>
                <div className="gate-grid">
                  {gateDefinitions.map((gate) => (
                    <label className={gateValues[gate.key] ? "gate gate-closed" : "gate"} key={gate.key}>
                      <input
                        type="checkbox"
                        checked={gateValues[gate.key]}
                        onChange={(event) => updateGate(gate.key, event.target.checked)}
                      />
                      <span className="gate-mark" aria-hidden="true">{gateValues[gate.key] ? "✓" : "!"}</span>
                      <strong>{gate.title}</strong>
                      <small>{gate.detail}</small>
                    </label>
                  ))}
                </div>
              </div>
            </form>

            <aside className="decision-panel" aria-live="polite">
              <div className="decision-code"><span>Recommendation</span><b>{decision.code}</b></div>
              <h3>{decision.label}</h3>
              <p className="decision-note">{decision.note}</p>

              <div className="score-pair">
                <div>
                  <span>Model fit</span>
                  <strong>{scores.fit}</strong><small>/100</small>
                  <i><b style={{ width: scores.fit + "%" }} /></i>
                </div>
                <div>
                  <span>Pilotability</span>
                  <strong>{scores.pilotability}</strong><small>/100</small>
                  <i><b style={{ width: scores.pilotability + "%" }} /></i>
                </div>
              </div>

              <div className="confidence-row">
                <span>Evidence</span>
                <strong>{confidence.label} confidence</strong>
                <p>{confidence.note}</p>
              </div>

              <div className="next-action">
                <span>{openGates.length > 0 ? "Gate to resolve first" : "Question to resolve next"}</span>
                <strong>{openGates[0]?.title || weakest.title}</strong>
                <p>
                  {openGates[0]?.detail ||
                    "Current input: " + signalValues[weakest.key] + "/5 · " + weakest.group}
                </p>
              </div>

              <button className="button button-accent" type="button" onClick={addToShortlist}>
                {saved ? "Added to comparison ✓" : "Add to comparison"} <span>→</span>
              </button>
              <a className="button button-quiet" href="#pilot">Open pilot memo <span>↓</span></a>
            </aside>
          </div>
        </div>
      </section>

      <section className="compare-section" id="compare">
        <div className="section-heading">
          <div>
            <p className="section-index">02 / candidate set</p>
            <h2>Compare opportunities on the same terms.</h2>
          </div>
          <p>
            A portfolio view prevents the most charismatic idea from winning by
            default. Recommendations are capped when a hard gate remains open.
          </p>
        </div>

        <div className="comparison-table" role="table" aria-label="Opportunity comparison">
          <div className="comparison-row comparison-header" role="row">
            <span role="columnheader">Opportunity</span>
            <span role="columnheader">Fit</span>
            <span role="columnheader">Pilot</span>
            <span role="columnheader">Evidence</span>
            <span role="columnheader">Recommendation</span>
            <span aria-hidden="true" />
          </div>
          {comparisonRows.map((candidate) => {
            const rowScores = getScores(candidate.signals);
            const rowDecision = getDecision(candidate.signals, candidate.gates);
            return (
              <div className="comparison-row" role="row" key={candidate.id + candidate.name}>
                <div role="cell">
                  <strong>{candidate.name}</strong>
                  <small>{candidate.partner} · {candidate.domain}</small>
                </div>
                <span role="cell">{rowScores.fit}</span>
                <span role="cell">{rowScores.pilotability}</span>
                <span role="cell">{getConfidence(candidate.evidence).label}</span>
                <span className={"decision-pill decision-" + rowDecision.code.toLowerCase()} role="cell">
                  {rowDecision.label}
                </span>
                <button type="button" onClick={() => loadCandidate(candidate)}>Open ↗</button>
              </div>
            );
          })}
        </div>

        <div className="example-library">
          <span>Load another working case</span>
          <div>
            {presets.map((preset) => (
              <button key={preset.id} type="button" onClick={() => loadCandidate(preset)}>
                {preset.name} <span>↗</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pilot-section" id="pilot">
        <div className="section-rail">
          <p className="section-index">03 / pilot memo</p>
          <h2>Convert the decision into a learning contract.</h2>
          <p>
            The memo aligns the technical test, partner value, held-out
            evaluation, and week-six decision before model work expands.
          </p>
          <div className="memo-actions">
            <button className="button button-dark" type="button" onClick={copyBrief}>
              {copied ? "Copied ✓" : "Copy memo"} <span>↗</span>
            </button>
            <button className="text-button" type="button" onClick={() => window.print()}>
              Print / save PDF
            </button>
          </div>
        </div>

        <article className="pilot-memo">
          <header>
            <div><span>Opportunity</span><strong>{currentCandidate.name}</strong></div>
            <div><span>Partner / team</span><strong>{currentCandidate.partner}</strong></div>
            <div><span>Decision</span><strong>{decision.label}</strong></div>
          </header>
          <div className="memo-title">
            <p>ACTION OPPORTUNITY / {domain.toUpperCase()}</p>
            <h3>{currentCandidate.behavior}</h3>
          </div>
          <div className="memo-scoreline">
            <div><span>Model fit</span><strong>{scores.fit}</strong></div>
            <div><span>Pilotability</span><strong>{scores.pilotability}</strong></div>
            <div><span>Evidence</span><strong>{confidence.label}</strong></div>
            <div><span>Gates</span><strong>{3 - openGates.length}/3</strong></div>
          </div>
          <div className="memo-grid">
            <div>
              <span>Primary success signal</span>
              <p>{currentCandidate.metric}</p>
            </div>
            <div>
              <span>Primary uncertainty</span>
              <p>{weakest.title}</p>
            </div>
            <div>
              <span>Weeks 1–2 · instrument</span>
              <p>Specify the action interface, align observations with outcomes, establish the baseline, and reserve a held-out condition.</p>
            </div>
            <div>
              <span>Weeks 3–4 · learn</span>
              <p>Adapt against one bounded behavior. Compare with the baseline and inspect action following alongside failure modes.</p>
            </div>
            <div>
              <span>Weeks 5–6 · stress-test</span>
              <p>Evaluate under held-out variation. Measure the success signal, intervention rate, latency, and boundary violations.</p>
            </div>
            <div>
              <span>Decision rule</span>
              <p>Advance only if performance improves, intended actions remain controllable, and the agreed pilot boundary holds.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="method-section" id="method">
        <div className="section-heading dark-heading">
          <div>
            <p className="section-index">04 / decision logic</p>
            <h2>A prioritization signal, not a feasibility verdict.</h2>
          </div>
          <p>
            The screen organizes a first conversation. Architecture, safety,
            integration cost, data governance, and model performance still
            require direct technical work.
          </p>
        </div>
        <div className="method-grid">
          <div><span>01</span><strong>Score two things</strong><p>Model fit asks whether the task rewards acting in space and time. Pilotability asks whether a fast learning loop can be built.</p></div>
          <div><span>02</span><strong>Cap with gates</strong><p>Usable data, a measurable outcome, and bounded failure are operating requirements—not weighted preferences.</p></div>
          <div><span>03</span><strong>Show confidence</strong><p>A measured workflow should carry more decision weight than an attractive hypothesis with the same score.</p></div>
        </div>
        <div className="source-block" id="sources">
          <div>
            <span>Public basis</span>
            <p>
              The framework is independent analysis grounded in General
              Intuition’s public descriptions of action models, world models,
              action-labeled data, MIRA, and selective partnerships across
              games, simulation, and robotics.
            </p>
          </div>
          <div className="source-links">
            <a href="https://www.generalintuition.com/" target="_blank" rel="noreferrer">General Intuition — company and research overview ↗</a>
            <a href="https://mira-wm.com/blog-post/" target="_blank" rel="noreferrer">MIRA — interactive world-model blog ↗</a>
            <a href="https://arxiv.org/abs/2607.05352" target="_blank" rel="noreferrer">MIRA — technical report ↗</a>
            <a href="https://partners.generalintuition.com/" target="_blank" rel="noreferrer">General Intuition — partner intake ↗</a>
          </div>
        </div>
      </section>

      <footer>
        <p>Independent work product based on public information.<br />No affiliation with or endorsement by General Intuition.</p>
        <a href="#top">Return to top ↑</a>
        <p>CONTROLLER TEST / 2026</p>
      </footer>
    </main>
  );
}
