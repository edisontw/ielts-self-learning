function lessonHasQuestion(lesson, questionId) {
  return Boolean(lesson && questionId && (lesson.sections || []).some(section =>
    (section.blocks || []).some(block => block?.type === 'quiz' && block.id === questionId)
  ));
}

export function retriableLessonError(error, lessons = []) {
  if (!error?.id || !error?.questionId || !error?.lessonId) return false;
  const lesson = lessons.find(item => item.id === error.lessonId);
  return lessonHasQuestion(lesson, error.questionId);
}

export function resetLessonErrorForRetry(core, error, lessons = []) {
  if (!retriableLessonError(error, lessons)) return false;
  core.lessonAnswers ||= {};
  core.fixedErrors ||= [];
  delete core.lessonAnswers[error.questionId];
  core.fixedErrors = core.fixedErrors.filter(id => id !== error.id);
  return true;
}

export function resolveSavedErrorsForCorrectAnswer(core, questionId) {
  if (!questionId) return [];
  core.errors ||= [];
  core.fixedErrors ||= [];
  const fixed = new Set(core.fixedErrors);
  const resolved = [];
  for (const error of core.errors) {
    if (error?.questionId !== questionId || !error.id || fixed.has(error.id)) continue;
    fixed.add(error.id);
    resolved.push(error.id);
  }
  core.fixedErrors = [...fixed];
  return resolved;
}

export function repairReadyToComplete(lesson, progress = {}) {
  if (!lesson?.questions?.length) return false;
  const answers = progress.answers || {};
  return lesson.questions.every((question, index) => {
    const saved = answers[index];
    return Boolean(saved?.checked && saved.selected === question.answer);
  });
}

export function resetRepairAnswer(progress, index) {
  progress.answers ||= {};
  delete progress.answers[index];
  if (progress.completed) {
    progress.completed = false;
    delete progress.completedAt;
  }
  return progress;
}
