import { useState, useEffect, useCallback } from "react";
import "./index.css";

const STORAGE_KEY = "user-profile";

// ─── Design Tokens ───
const T = {
  bg: "#0A0A0B",
  surface: "#111113",
  surfaceHover: "#18181B",
  border: "#27272A",
  borderFocus: "#3F3F46",
  text: "#FAFAFA",
  textMuted: "#A1A1AA",
  textDim: "#52525B",
  accent: "#E4FF54",
  accentDim: "#C8E03A",
  danger: "#EF4444",
  success: "#22C55E",
  font: "'IBM Plex Mono', 'SF Mono', 'Fira Code', monospace",
  fontBody: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

// ─── Reusable Components ───

function ProgressBar({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6, padding: "0 0 32px 0" }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            height: 3,
            flex: 1,
            borderRadius: 2,
            background: i <= current ? T.accent : T.border,
            transition: "background 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      ))}
    </div>
  );
}

function StepLabel({ number, text }) {
  return (
    <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          fontFamily: T.font,
          fontSize: 11,
          color: T.accent,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        {number}
      </span>
      <span style={{ width: 20, height: 1, background: T.border, display: "block" }} />
      <span
        style={{
          fontFamily: T.font,
          fontSize: 11,
          color: T.textDim,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        {text}
      </span>
    </div>
  );
}

function Heading({ children }) {
  return (
    <h1
      style={{
        fontFamily: T.fontBody,
        fontSize: 32,
        fontWeight: 600,
        color: T.text,
        lineHeight: 1.2,
        margin: "0 0 10px 0",
        letterSpacing: "-0.02em",
      }}
    >
      {children}
    </h1>
  );
}

function Subtext({ children }) {
  return (
    <p
      style={{
        fontFamily: T.fontBody,
        fontSize: 15,
        color: T.textMuted,
        lineHeight: 1.6,
        margin: "0 0 36px 0",
        maxWidth: 480,
      }}
    >
      {children}
    </p>
  );
}

function TextInput({ value, onChange, placeholder, autoFocus }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      style={{
        width: "100%",
        padding: "14px 16px",
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        color: T.text,
        fontFamily: T.fontBody,
        fontSize: 15,
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.2s",
      }}
      onFocus={(e) => (e.target.style.borderColor = T.accent)}
      onBlur={(e) => (e.target.style.borderColor = T.border)}
    />
  );
}

function ChipSelect({ options, selected, onToggle, multi = true }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((opt) => {
        const isActive = multi ? selected.includes(opt.id) : selected === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onToggle(opt.id)}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: `1.5px solid ${isActive ? T.accent : T.border}`,
              background: isActive ? T.accent + "12" : "transparent",
              color: isActive ? T.accent : T.textMuted,
              fontFamily: T.fontBody,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {opt.icon && <span style={{ fontSize: 16 }}>{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SkillSlider({ value, onChange, labels }) {
  return (
    <div>
      <input
        type="range"
        min={0}
        max={labels.length - 1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: "100%",
          accentColor: T.accent,
          cursor: "pointer",
          height: 6,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        {labels.map((l, i) => (
          <span
            key={i}
            style={{
              fontFamily: T.font,
              fontSize: 11,
              color: i === value ? T.accent : T.textDim,
              fontWeight: i === value ? 600 : 400,
              transition: "all 0.2s",
              textAlign: "center",
              flex: 1,
            }}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel = "Continue", nextDisabled = false, showBack = true }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48 }}>
      {showBack ? (
        <button
          onClick={onBack}
          style={{
            padding: "12px 24px",
            background: "transparent",
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            color: T.textMuted,
            fontFamily: T.fontBody,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Back
        </button>
      ) : (
        <div />
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        style={{
          padding: "12px 28px",
          background: nextDisabled ? T.border : T.accent,
          border: "none",
          borderRadius: 8,
          color: nextDisabled ? T.textDim : T.bg,
          fontFamily: T.fontBody,
          fontSize: 14,
          fontWeight: 600,
          cursor: nextDisabled ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          letterSpacing: "-0.01em",
        }}
      >
        {nextLabel} →
      </button>
    </div>
  );
}

// ─── Data ───

const ROLES = [
  { id: "developer", label: "Developer", icon: "⌨️" },
  { id: "designer", label: "Designer", icon: "🎨" },
  { id: "founder", label: "Founder / PM", icon: "🚀" },
  { id: "student", label: "Student", icon: "📚" },
  { id: "hobbyist", label: "Hobbyist", icon: "🧪" },
  { id: "other", label: "Other", icon: "✦" },
];

const LANGUAGES = [
  { id: "javascript", label: "JavaScript / TS" },
  { id: "python", label: "Python" },
  { id: "react", label: "React / Next.js" },
  { id: "vue", label: "Vue / Nuxt" },
  { id: "swift", label: "Swift / iOS" },
  { id: "kotlin", label: "Kotlin / Android" },
  { id: "rust", label: "Rust" },
  { id: "go", label: "Go" },
  { id: "ruby", label: "Ruby / Rails" },
  { id: "php", label: "PHP / Laravel" },
  { id: "java", label: "Java / Spring" },
  { id: "csharp", label: "C# / .NET" },
  { id: "none", label: "No code yet" },
];

const AI_TOOLS = [
  { id: "chatgpt", label: "ChatGPT", icon: "◐" },
  { id: "claude", label: "Claude", icon: "◑" },
  { id: "copilot", label: "GitHub Copilot", icon: "◒" },
  { id: "cursor", label: "Cursor", icon: "◓" },
  { id: "v0", label: "v0", icon: "▲" },
  { id: "bolt", label: "Bolt / Lovable", icon: "⚡" },
  { id: "midjourney", label: "Midjourney / DALL-E", icon: "◈" },
  { id: "none", label: "None yet", icon: "○" },
];

const GOALS = [
  { id: "saas", label: "SaaS product" },
  { id: "portfolio", label: "Portfolio / personal site" },
  { id: "mobile", label: "Mobile app" },
  { id: "automation", label: "Automations / scripts" },
  { id: "prototype", label: "Rapid prototypes" },
  { id: "internal", label: "Internal tools" },
  { id: "learning", label: "Learning to code" },
  { id: "freelance", label: "Client / freelance work" },
];

const SKILL_LABELS = ["Brand new", "Beginner", "Intermediate", "Advanced", "Expert"];

// ─── Steps ───

function StepWelcome({ data, setData, onNext }) {
  return (
    <div>
      <StepLabel number="00" text="Welcome" />
      <Heading>Let's set up your workspace.</Heading>
      <Subtext>
        We'll ask a few questions to calibrate everything — your skill level, your
        stack, how you like to work. Takes about 90 seconds.
      </Subtext>
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            fontFamily: T.font,
            fontSize: 11,
            color: T.textDim,
            letterSpacing: 1,
            textTransform: "uppercase",
            display: "block",
            marginBottom: 8,
          }}
        >
          What should we call you?
        </label>
        <TextInput
          value={data.name}
          onChange={(v) => setData({ ...data, name: v })}
          placeholder="Your name"
          autoFocus
        />
      </div>
      <NavButtons onNext={onNext} nextDisabled={!data.name.trim()} showBack={false} nextLabel="Let's go" />
    </div>
  );
}

function StepRole({ data, setData, onNext, onBack }) {
  return (
    <div>
      <StepLabel number="01" text="Role" />
      <Heading>What best describes you?</Heading>
      <Subtext>This helps us tailor the experience. Pick the closest fit.</Subtext>
      <ChipSelect
        options={ROLES}
        selected={data.role}
        onToggle={(id) => setData({ ...data, role: id })}
        multi={false}
      />
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!data.role} />
    </div>
  );
}

function StepSkill({ data, setData, onNext, onBack }) {
  return (
    <div>
      <StepLabel number="02" text="Skill level" />
      <Heading>How comfortable are you with code?</Heading>
      <Subtext>
        Be honest — this directly affects how we scaffold your projects and what
        we explain vs. skip.
      </Subtext>
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: "28px 24px",
        }}
      >
        <SkillSlider
          value={data.skillLevel}
          onChange={(v) => setData({ ...data, skillLevel: v })}
          labels={SKILL_LABELS}
        />
      </div>
      <div
        style={{
          marginTop: 20,
          padding: "14px 16px",
          background: T.accent + "08",
          border: `1px solid ${T.accent}22`,
          borderRadius: 8,
        }}
      >
        <p
          style={{
            fontFamily: T.fontBody,
            fontSize: 13,
            color: T.textMuted,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {
            [
              "No worries — we'll walk you through everything step by step. You'll learn as you build.",
              "You know some basics. We'll provide templates and explain the key decisions.",
              "Solid foundation. We'll focus on architecture choices and skip the basics.",
              "Strong skills. We'll get straight to the nuanced stuff — trade-offs, patterns, edge cases.",
              "You know what you're doing. We'll be a second brain, not a teacher.",
            ][data.skillLevel]
          }
        </p>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function StepStack({ data, setData, onNext, onBack }) {
  const toggle = (id) => {
    const s = new Set(data.languages);
    if (id === "none") {
      setData({ ...data, languages: ["none"] });
      return;
    }
    s.delete("none");
    s.has(id) ? s.delete(id) : s.add(id);
    setData({ ...data, languages: [...s] });
  };
  return (
    <div>
      <StepLabel number="03" text="Stack" />
      <Heading>What's in your toolkit?</Heading>
      <Subtext>Select all languages and frameworks you use or want to use.</Subtext>
      <ChipSelect options={LANGUAGES} selected={data.languages} onToggle={toggle} />
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={data.languages.length === 0} />
    </div>
  );
}

function StepAITools({ data, setData, onNext, onBack }) {
  const toggle = (id) => {
    const s = new Set(data.aiTools);
    if (id === "none") {
      setData({ ...data, aiTools: ["none"] });
      return;
    }
    s.delete("none");
    s.has(id) ? s.delete(id) : s.add(id);
    setData({ ...data, aiTools: [...s] });
  };
  return (
    <div>
      <StepLabel number="04" text="AI tools" />
      <Heading>Which AI tools do you use?</Heading>
      <Subtext>
        Understanding your current workflow helps us avoid redundant suggestions
        and build on what you already know.
      </Subtext>
      <ChipSelect options={AI_TOOLS} selected={data.aiTools} onToggle={toggle} />
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={data.aiTools.length === 0} />
    </div>
  );
}

function StepGoals({ data, setData, onNext, onBack }) {
  const toggle = (id) => {
    const s = new Set(data.goals);
    s.has(id) ? s.delete(id) : s.add(id);
    setData({ ...data, goals: [...s] });
  };
  return (
    <div>
      <StepLabel number="05" text="Goals" />
      <Heading>What are you building toward?</Heading>
      <Subtext>Pick all that apply. This shapes the kind of projects and prompts we'll generate.</Subtext>
      <ChipSelect options={GOALS} selected={data.goals} onToggle={toggle} />
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Finish setup" nextDisabled={data.goals.length === 0} />
    </div>
  );
}

function StepComplete({ data, onReset }) {
  const roleLabel = ROLES.find((r) => r.id === data.role)?.label || data.role;
  const langLabels = data.languages.map((id) => LANGUAGES.find((l) => l.id === id)?.label || id);
  const toolLabels = data.aiTools.map((id) => AI_TOOLS.find((t) => t.id === id)?.label || id);
  const goalLabels = data.goals.map((id) => GOALS.find((g) => g.id === id)?.label || id);

  const rows = [
    ["Role", roleLabel],
    ["Skill", SKILL_LABELS[data.skillLevel]],
    ["Stack", langLabels.join(", ")],
    ["AI Tools", toolLabels.join(", ")],
    ["Goals", goalLabels.join(", ")],
  ];

  return (
    <div>
      <StepLabel number="✓" text="Complete" />
      <Heading>Welcome, {data.name}.</Heading>
      <Subtext>
        Your profile is saved. Here's what we know — this will shape every
        project scaffold, prompt, and suggestion you see.
      </Subtext>
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {rows.map(([label, value], i) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "14px 20px",
              borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
              gap: 24,
            }}
          >
            <span
              style={{
                fontFamily: T.font,
                fontSize: 12,
                color: T.textDim,
                letterSpacing: 1,
                textTransform: "uppercase",
                flexShrink: 0,
                paddingTop: 2,
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontFamily: T.fontBody,
                fontSize: 14,
                color: T.text,
                textAlign: "right",
                lineHeight: 1.5,
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
        <button
          onClick={() => {
            /* placeholder for next phase */
          }}
          style={{
            flex: 1,
            padding: "14px 24px",
            background: T.accent,
            border: "none",
            borderRadius: 8,
            color: T.bg,
            fontFamily: T.fontBody,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Start first project →
        </button>
        <button
          onClick={onReset}
          style={{
            padding: "14px 20px",
            background: "transparent",
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            color: T.textMuted,
            fontFamily: T.fontBody,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Redo
        </button>
      </div>
    </div>
  );
}

// ─── Main App ───

const TOTAL_STEPS = 7; // 0-6

const DEFAULT_DATA = {
  name: "",
  role: null,
  skillLevel: 2,
  languages: [],
  aiTools: [],
  goals: [],
  completedAt: null,
};

export default function OnboardingApp() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);

  // ── Load from storage ──
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          setData(parsed);
          if (parsed.completedAt) setStep(TOTAL_STEPS - 1);
        }
      } catch (e) {
        // No saved data, start fresh
      }
      setLoaded(true);
    })();
  }, []);

  // ── Save to storage ──
  const saveProfile = useCallback(
    async (profileData) => {
      setSaving(true);
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify(profileData));
      } catch (e) {
        console.error("Storage save failed:", e);
      }
      setSaving(false);
    },
    []
  );

  const go = (dir) => {
    setFadeKey((k) => k + 1);
    setStep((s) => s + dir);
  };

  const next = () => {
    if (step === TOTAL_STEPS - 2) {
      // Last step before complete — save
      const final = { ...data, completedAt: new Date().toISOString() };
      setData(final);
      saveProfile(final);
    } else {
      // Auto-save progress on each step
      saveProfile(data);
    }
    go(1);
  };

  const reset = async () => {
    setData(DEFAULT_DATA);
    setStep(0);
    setFadeKey((k) => k + 1);
    try {
      await window.storage.delete(STORAGE_KEY);
    } catch (e) {}
  };

  if (!loaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: T.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontFamily: T.font, fontSize: 13, color: T.textDim }}>
          Loading...
        </span>
      </div>
    );
  }

  const stepProps = { data, setData, onNext: next, onBack: () => go(-1) };

  const steps = [
    <StepWelcome {...stepProps} />,
    <StepRole {...stepProps} />,
    <StepSkill {...stepProps} />,
    <StepStack {...stepProps} />,
    <StepAITools {...stepProps} />,
    <StepGoals {...stepProps} />,
    <StepComplete data={data} onReset={reset} />,
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div style={{ width: "100%", maxWidth: 560 }}>
        <ProgressBar current={step} total={TOTAL_STEPS} />
        <div key={fadeKey} style={{ animation: "fadeSlide 0.35s ease-out" }}>
          {steps[step]}
        </div>
        {saving && (
          <div
            style={{
              position: "fixed",
              bottom: 20,
              right: 20,
              fontFamily: T.font,
              fontSize: 11,
              color: T.textDim,
              background: T.surface,
              border: `1px solid ${T.border}`,
              padding: "6px 12px",
              borderRadius: 6,
            }}
          >
            Saving...
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: ${T.border};
          border-radius: 4px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${T.accent};
          cursor: pointer;
          border: 3px solid ${T.bg};
          box-shadow: 0 0 0 1px ${T.accent};
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${T.accent};
          cursor: pointer;
          border: 3px solid ${T.bg};
          box-shadow: 0 0 0 1px ${T.accent};
        }
        ::selection {
          background: ${T.accent}44;
          color: ${T.text};
        }
      `}</style>
    </div>
  );
}