import type { Metadata } from "next";
import SurveyClient from "./survey-client";

export const metadata: Metadata = {
  title: "Encuesta Validación Retainer | Kumbre Digital"
};

export default function ValidacionSegundaHipotesisPage() {
  return <SurveyClient />;
}
