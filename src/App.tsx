import { Questionnaire } from "./components/Questionnaire";
import type {
  Questionnaire as QuestionnaireType,
  QuestionnaireAnswers,
} from "./types/questionnaire";
import linuxQuestionnaire from "./data/linux-distro-survey.json";

function App() {
  const handleQuestionnaireComplete = (answers: QuestionnaireAnswers) => {
    console.log("Questionnaire completed with answers:", answers);
  };

  return (
    <>
      <Questionnaire
        questionnaire={linuxQuestionnaire as QuestionnaireType}
        onComplete={handleQuestionnaireComplete}
      />
    </>
  );
}

export default App;
