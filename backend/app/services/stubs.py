"""
Fake LLM responses for demo/frontend development.
Set STUB_LLM=true in your .env to use these instead of calling OpenRouter.

Each function returns a string exactly as the real LLM would — including any
special markers the routes look for. Edit the text freely to change what the
"AI" says during a demo.
"""
from __future__ import annotations


# ---------------------------------------------------------------------------
# Interview stub
# When the interview route receives this, it detects ===INTERVIEW_COMPLETE===,
# strips it from the display text, parses the JSON, creates the project scope,
# and creates the suggested tasks automatically.
# ---------------------------------------------------------------------------

# How many user messages to respond with "keep going" before triggering completion.
# Set to 0 to complete on the very first message.
INTERVIEW_TURNS_BEFORE_COMPLETE = 1

_INTERVIEW_FOLLOWUP = (
    "That's a great start! A couple more questions to help me understand the scope better: "
    "Who are the main users of this app, and do you have any preference on the tech stack you'd like to use?"
)

_INTERVIEW_COMPLETE = """Great, I have everything I need to define your project scope!

Here's what we'll build: a web app that lets users track their personal fitness goals, log workouts, and visualize progress over time. It'll be clean, mobile-friendly, and simple enough to actually use daily.

===INTERVIEW_COMPLETE===
{
  "scope_summary": "A personal fitness tracker web app where users can set goals, log workouts, and view progress charts.",
  "scope_detail": "The app will have user authentication, a dashboard showing recent activity and goal progress, a workout logging form (exercise, sets, reps, duration), and a simple chart view of historical data. Mobile-responsive design is a priority.",
  "tech_stack": ["React", "FastAPI", "SQLite", "Tailwind CSS"],
  "suggested_tasks": [
    {
      "title": "Set up project structure and routing"
    },
    {
      "title": "Build user authentication (login / signup)"
    },
    {
      "title": "Create workout logging form"
    },
    {
      "title": "Build dashboard with goal progress summary"
    },
    {
      "title": "Add progress chart using historical workout data"
    }
  ]
}"""


def get_interview_stub(turn: int) -> str:
    """
    Returns a follow-up response for the first INTERVIEW_TURNS_BEFORE_COMPLETE
    turns, then returns the completion response which ends the interview.

    `turn` is 0-indexed (0 = first user message).
    """
    if turn < INTERVIEW_TURNS_BEFORE_COMPLETE:
        return _INTERVIEW_FOLLOWUP
    return _INTERVIEW_COMPLETE


# ---------------------------------------------------------------------------
# Scope chat stub
# The scope chat route looks for ===TASK_CREATED=== and ===SCOPE_UPDATED===.
# Return plain text for a normal reply, or include a marker to trigger an action.
# ---------------------------------------------------------------------------

_SCOPE_CHAT_DEFAULT = (
    "Good point! I've noted that. You can also ask me to add a new task, "
    "or to update the project scope summary if the direction has changed."
)

_SCOPE_CHAT_WITH_TASK = """Sure, I'll add that as a task.

===TASK_CREATED===
{
  "title": "Add dark mode support",
  "task_summary": "Implement a dark/light mode toggle that persists the user's preference.",
  "implementation_plan": "1. Add a theme context with useState.\\n2. Toggle a `dark` class on the root element.\\n3. Use Tailwind dark: variants for styling.\\n4. Persist preference to localStorage."
}"""

# Simple counter so the first scope chat message creates a task, the rest are plain replies.
# The route doesn't pass any state here, so we use a module-level counter.
_scope_chat_call_count = 0


def get_scope_chat_stub(content: str) -> str:
    """
    Returns a stub scope chat response.
    If the user message contains 'task' or 'add', returns a response that creates a task.
    Otherwise returns a plain conversational reply.
    """
    lowered = content.lower()
    if any(kw in lowered for kw in ("task", "add", "create", "new feature", "feature")):
        return _SCOPE_CHAT_WITH_TASK
    return _SCOPE_CHAT_DEFAULT


# ---------------------------------------------------------------------------
# Task chat stub
# The task chat route looks for ===TASK_UPDATED===.
# Return plain text for a normal reply, or include the marker to update the task.
# ---------------------------------------------------------------------------

_TASK_CHAT_DEFAULT = (
    "Happy to help clarify. For this task, I'd recommend starting with the data model "
    "before touching the UI — it'll make the component logic much cleaner. "
    "Let me know if you want me to refine the implementation plan."
)

_TASK_CHAT_WITH_UPDATE = """Got it, I'll update the task with a more detailed plan.

===TASK_UPDATED===
{
  "task_summary": "Build the workout logging form with validation and submission to the backend API.",
  "implementation_plan": "1. Create a controlled form component with fields: exercise name, sets, reps, duration, date.\\n2. Add client-side validation (required fields, numeric inputs).\\n3. On submit, POST to /api/workouts.\\n4. Show a success toast and reset the form.\\n5. Handle API errors with an inline error message."
}"""


def get_task_chat_stub(content: str) -> str:
    """
    Returns a stub task chat response.
    If the user message contains 'update', 'plan', or 'detail', returns a response that updates the task.
    Otherwise returns a plain conversational reply.
    """
    lowered = content.lower()
    if any(kw in lowered for kw in ("update", "plan", "detail", "refine", "change")):
        return _TASK_CHAT_WITH_UPDATE
    return _TASK_CHAT_DEFAULT


# ---------------------------------------------------------------------------
# Prompt generation stub
# Returns a fake copy-paste-ready implementation prompt for a task.
# ---------------------------------------------------------------------------

_GENERATE_PROMPT = """## Goal
Build a workout logging form that allows users to record exercise sessions and submit them to the backend.

## Technical Requirements
- **Framework:** React with hooks
- **Styling:** Tailwind CSS
- **API:** POST to `/api/workouts` (FastAPI backend)
- **Validation:** Client-side only for now

## Implementation Steps

1. **Create `WorkoutForm.jsx`** in `src/components/`
2. **Form fields:**
   - Exercise name (text input, required)
   - Sets (number input, min 1)
   - Reps (number input, min 1)
   - Duration in minutes (number input, optional)
   - Date (date picker, defaults to today)
3. **State management:** Use `useState` for each field
4. **Submission:** Call `POST /api/workouts` with JSON body, handle loading/error states
5. **Success:** Show a toast notification, reset form fields
6. **Error handling:** Display inline error message below the form on API failure

## File Structure
```
src/
  components/
    WorkoutForm.jsx   ← new file
  api/
    client.js         ← add postWorkout() helper
```

## Edge Cases
- Prevent double-submission (disable button while loading)
- Validate that sets/reps are positive integers before submitting
- Handle network errors gracefully

## Testing
- Render the form, fill all fields, submit, and assert the API was called with correct data
- Test validation: submit with empty exercise name and assert error is shown
"""


def get_generate_prompt_stub() -> str:
    return _GENERATE_PROMPT
