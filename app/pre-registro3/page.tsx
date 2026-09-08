"use client"
import React from 'react'
import { useState } from "react"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import { toast } from "sonner"



function Preregistro3() {

    const [answers, setAnswers] = useState(["", ""])

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        console.log("Form submitted")
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        
        const answers = {
            semanas: formData.get("semanas"),
            notificacion: formData.getAll("notificacion"), 
            numero: formData.get("numero"),
            email: formData.get("email"),
        }

        console.log("Answers:", answers)

        toast("Agent plan saved", {
            description: `Semanas: ${answers.semanas ?? "None"} · Notificaciones: ${answers.notificacion.join(", ") || "None"} · Número: ${answers.numero ?? "None"} · Email: ${answers.email ?? "None"}`,
        })
    }

    const questions = [
        {
            name: "semanas",
            question: "¿Cuántas semanas de embarazo tienes? (Max: 40 Semanas)",
            anstype: "input",
            placeholder: "Escribe el número de semanas",
            required: true,
        },

        {
            name: "notificacion",
            multiple: true,
            question: "¿Donde quieres que te notifiquemos cuando abramos nuestra membresia?",
            anstype: "choices",
            required: true,
            choices: [
                {   
                    value: "whatsapp",
                    label: "Whatsapp",
                    description: "Tendras que poner tu Numero de telefono",
                },
                {
                    value: "email",
                    label: "Email",
                    description: "Tendras que poner tu Email"
                },
            ]
        },
        {
            name: "numero",
            question: "¿Cuál es tu número de teléfono?",
            anstype: "input",
            placeholder: "Escribe tu número de teléfono",
            required: true,
            disabled: answers[0] !== "whatsapp", // Deshabilitado por defecto
        },
        {
            name: "email",
            question: "¿Cuál es tu correo electrónico?",
            anstype: "input",
            placeholder: "Escribe tu correo electrónico",
            required: true,
            disabled: answers[1] !== "email", // Deshabilitado por defecto
        }
    ]

  return (
    <div className="min-h-screen flex items-center justify-center justify-between">
        <Questionnaire items={questions} onSubmit={handleSubmit} className="w-full max-w-2xl">
            <QuestionnaireProgress />
            {questions.map((question) => 
                <QuestionnaireItem 
                key={question.name}
                name={question.name}
                required={question.required}
                multiple={"multiple" in question && question.multiple}
                disabled={question.disabled}
                >
                    <QuestionnaireTitle>{question.question}</QuestionnaireTitle>
                    {question.anstype == "input" ? (
                        <QuestionnaireInput placeholder={question.placeholder} aria-label={question.name}></QuestionnaireInput>
                    ) : (
                        <QuestionnaireChoices>
                            {question.choices?.map((choice, index) => (
                                <QuestionnaireChoice key={choice.value} value={choice.value} onChange={() => {
                                    const newAnswers = [...answers]
                                    if (newAnswers[index] === choice.value) {
                                        newAnswers[index] = ""
                                    } else {
                                        newAnswers[index] = choice.value
                                    }
                                    setAnswers(newAnswers)
                                    console.log(newAnswers)
                                }}>
                                    <span className='font-medium'>{choice.label}</span>
                                    <span className='text-muted-foreground'>{choice.description}</span>
                        </QuestionnaireChoice>
                            ))}
                        </QuestionnaireChoices>
                    )}
                <QuestionnaireError>Elige una opción</QuestionnaireError>
                </QuestionnaireItem>
            )}
                <QuestionnaireActions>
                    <QuestionnairePrevious />
                    <QuestionnaireSkip />
                    <QuestionnaireNext>Siguiente</QuestionnaireNext>
                    <QuestionnaireSubmit>Enviar</QuestionnaireSubmit>
                </QuestionnaireActions>
        </Questionnaire>
        <div>hola</div>
    </div>
  )
}

export default Preregistro3