document.addEventListener('DOMContentLoaded', () => {
    const quizContainer = document.getElementById('quiz');

    const quizData = [
        {
            question: "Quem foi o primeiro rei de Israel?",
            answers: {
                a: "Davi",
                b: "Saul",
                c: "Salomão"
            },
            correctAnswer: "b"
        },
        {
            question: "Qual o menor livro da Bíblia?",
            answers: {
                a: "Judas",
                b: "Tito",
                c: "II João"
            },
            correctAnswer: "c"
        },
        {
            question: "Quem escreveu a maior parte dos livros do Novo Testamento?",
            answers: {
                a: "Paulo",
                b: "Pedro",
                c: "João"
            },
            correctAnswer: "a"
        }
    ];

    function buildQuiz() {
        const output = [];

        quizData.forEach((currentQuestion, questionNumber) => {
            const answers = [];
            for (let letter in currentQuestion.answers) {
                answers.push(
                    `<label>
                        <input type="radio" name="question${questionNumber}" value="${letter}">
                        ${letter} :
                        ${currentQuestion.answers[letter]}
                    </label>`
                );
            }

            output.push(
                `<div class="question"> ${currentQuestion.question} </div>
                <div class="answers"> ${answers.join('')} </div>`
            );
        });

        quizContainer.innerHTML = output.join('');
    }

    function showResults() {
        const answerContainers = quizContainer.querySelectorAll('.answers');
        let numCorrect = 0;

        quizData.forEach((currentQuestion, questionNumber) => {
            const answerContainer = answerContainers[questionNumber];
            const selector = `input[name=question${questionNumber}]:checked`;
            const userAnswer = (answerContainer.querySelector(selector) || {}).value;

            if (userAnswer === currentQuestion.correctAnswer) {
                numCorrect++;
                answerContainers[questionNumber].style.color = 'lightgreen';
            } else {
                answerContainers[questionNumber].style.color = 'red';
            }
        });

        const resultsContainer = document.createElement('div');
        resultsContainer.innerHTML = `Você acertou ${numCorrect} de ${quizData.length} perguntas.`;
        quizContainer.appendChild(resultsContainer);
    }

    buildQuiz();

    const submitButton = document.createElement('button');
    submitButton.innerText = 'Verificar Respostas';
    submitButton.addEventListener('click', showResults);
    quizContainer.appendChild(submitButton);
});
