"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Props {
  employeeId: string;
  onComplete: (data: Record<string, unknown>) => void;
  data: Record<string, unknown> | null;
}

const MIN_ANSWERS_REQUIRED = 10;
const FALLBACK_TIME_SECONDS = 300; // 5 min fallback if postMessage doesn't work

export function QuizStep({ onComplete }: Props) {
  const [answersCount, setAnswersCount] = useState(0);
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const hasEnoughAnswers = answersCount >= MIN_ANSWERS_REQUIRED;
  const fallbackReached = secondsSpent >= FALLBACK_TIME_SECONDS;
  const canComplete = hasEnoughAnswers || fallbackReached;

  // Listen for postMessage from quiz iframe
  const handleMessage = useCallback((event: MessageEvent) => {
    // Accept messages from the quiz domain
    if (event.origin !== "https://sondregysland-design.github.io") return;

    if (event.data?.type === "quiz-answer" || event.data?.type === "question-answered") {
      setAnswersCount((prev) => prev + 1);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  // Timer as fallback
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {showInstructions ? (
        <Card padding="md">
          <div className="space-y-4">
            <h4 className="font-bold text-navy-900 text-lg">Slik spiller du OMT Elektro-quiz</h4>

            <div className="bg-navy-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-navy-900 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">1</span>
                <div>
                  <p className="font-medium text-navy-900">Beveg Mario</p>
                  <p className="text-sm text-gray-600">Bruk <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">Piltaster</kbd> eller <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">A</kbd>/<kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">D</kbd> for å gå til venstre/høyre</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-navy-900 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">2</span>
                <div>
                  <p className="font-medium text-navy-900">Hopp</p>
                  <p className="text-sm text-gray-600">Trykk <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">Mellomrom</kbd> eller <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">W</kbd> eller <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">Pil opp</kbd> for å hoppe</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-navy-900 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">3</span>
                <div>
                  <p className="font-medium text-navy-900">Svar på spørsmål</p>
                  <p className="text-sm text-gray-600">Når du treffer en blokk med spørsmål, velg riktig svar. Du må svare på <strong>minst {MIN_ANSWERS_REQUIRED} spørsmål</strong> for å fullføre steget.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-navy-900 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">4</span>
                <div>
                  <p className="font-medium text-navy-900">Unngå fiender</p>
                  <p className="text-sm text-gray-600">Hopp over eller unngå hindringer på veien. Feil svar = du mister et liv!</p>
                </div>
              </div>
            </div>

            <Button onClick={() => setShowInstructions(false)} className="w-full">
              Jeg forstår — start quizen!
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="rounded-lg overflow-hidden border border-gray-200" role="region" aria-label="Elektro-quiz">
            <iframe
              src="https://sondregysland-design.github.io/omt-elektro-quize/"
              width="100%"
              height="600"
              style={{ border: "none" }}
              title="OMT Elektro Quiz"
              allow="autoplay"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium text-navy-900">Spørsmål besvart:</span>{" "}
              <span className={hasEnoughAnswers ? "text-green-700 font-bold" : "text-gray-600"}>
                {answersCount} / {MIN_ANSWERS_REQUIRED}
              </span>
            </div>
            {!hasEnoughAnswers && !fallbackReached && (
              <div className="text-xs text-gray-500">
                {Math.ceil((FALLBACK_TIME_SECONDS - secondsSpent) / 60)} min igjen
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            Styring: Piltaster/WASD for bevegelse, mellomrom for hopp
          </p>

          <Button
            onClick={() => onComplete({
              completedAt: new Date().toISOString(),
              timeSpent: secondsSpent,
              answersCount,
              completedVia: hasEnoughAnswers ? "answers" : "fallback-timer",
            })}
            className="w-full"
            disabled={!canComplete}
          >
            {canComplete
              ? "Marker som fullført"
              : `Svar på ${MIN_ANSWERS_REQUIRED - answersCount} spørsmål til...`}
          </Button>
        </>
      )}
    </div>
  );
}
