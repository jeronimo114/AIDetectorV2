"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";

const ENDPOINT_URL =
  "https://n8n.srv948654.hstgr.cloud/webhook/validacion-2da-hipotesis";

type SurveyPayload = {
  [key: string]: string | { submittedAt: string; userAgent: string };
  _meta: { submittedAt: string; userAgent: string };
};

export default function SurveyClient() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [status, setStatus] = useState("");

  const serializeForm = (formEl: HTMLFormElement): SurveyPayload => {
    const data: SurveyPayload = {
      _meta: {
        submittedAt: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    };
    const fd = new FormData(formEl);
    for (const [key, value] of fd.entries()) {
      data[key] = (value || "").toString().trim();
    }
    return data;
  };

  const downloadJSON = (payload: SurveyPayload, filename = "respuestas-encuesta.json") => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    if (!formRef.current) {
      return;
    }
    const payload = serializeForm(formRef.current);
    downloadJSON(payload);
    setStatus("Descargado: respuestas-encuesta.json");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formRef.current) {
      return;
    }
    setStatus("Enviando…");

    const payload = serializeForm(formRef.current);

    if (!ENDPOINT_URL || ENDPOINT_URL === "YOUR_ENDPOINT_URL") {
      downloadJSON(payload);
      setStatus("No hay endpoint configurado. Se descargó el JSON localmente.");
      return;
    }

    try {
      const response = await fetch(ENDPOINT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setStatus("Listo. Respuestas enviadas.");
      formRef.current.reset();
    } catch (error) {
      console.error(error);
      setStatus(
        "Error al enviar. Descarga el JSON y reintenta o revisa el endpoint."
      );
      downloadJSON(payload);
    }
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --bg: #ffffff;
          --text: #0b1220;
          --muted: #5b6476;
          --border: #e7e9ee;
          --brand: #1b66ff;
        }
        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial,
            sans-serif;
          background: var(--bg);
          color: var(--text);
        }
        .wrap {
          max-width: 920px;
          margin: 0 auto;
          padding: 28px 16px 80px;
        }
        .card {
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(17, 24, 39, 0.06);
        }
        h1 {
          font-size: 22px;
          margin: 0 0 10px;
        }
        p {
          margin: 6px 0 0;
          color: var(--muted);
          line-height: 1.5;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        label {
          font-weight: 600;
          display: block;
          margin: 10px 0 6px;
        }
        textarea,
        input,
        select {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px;
          font-size: 14px;
          outline: none;
        }
        textarea {
          min-height: 110px;
          resize: vertical;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .btns {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        button {
          border: 0;
          border-radius: 12px;
          padding: 12px 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .primary {
          background: var(--brand);
          color: white;
        }
        .ghost {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }
        .note {
          font-size: 13px;
          color: var(--muted);
          margin-top: 10px;
        }
        .status {
          margin-top: 12px;
          font-size: 14px;
        }
        .vsl {
          aspect-ratio: 16 / 9;
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }
        .vsl iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }
        @media (min-width: 820px) {
          .row {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <div className="wrap">
        <div className="card">
          <h1>Encuesta de validación: Retainer mensual (Kumbre Digital)</h1>
          <p>
            Instrucciones: mira el VSL completo y responde con honestidad. Este
            ejercicio es académico y no constituye una oferta comercial.
          </p>
        </div>

        <div style={{ height: 14 }} />

        <div className="card">
          <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>1) VSL</h2>
          <div className="vsl">
            <iframe
              src="https://fast.wistia.net/embed/iframe/d2sjj6y0rj?seo=true&videoFoam=true"
              allow="autoplay; fullscreen"
              allowFullScreen
              title="VSL Kumbre Digital"
            />
          </div>
          <p className="note">Cuando termines el video, completa la encuesta.</p>
        </div>

        <div style={{ height: 14 }} />

        <form
          id="survey"
          className="card"
          ref={formRef}
          onSubmit={handleSubmit}
        >
          <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>2) Respuestas</h2>

          <div className="row">
            <div>
              <label htmlFor="role">Rol / Cargo</label>
              <input
                id="role"
                name="role"
                placeholder="Ej: Director Comercial, Líder Transformación Digital, Fundador"
                required
              />
            </div>
            <div>
              <label htmlFor="companyType">Tipo de empresa</label>
              <select id="companyType" name="companyType" defaultValue="" required>
                <option value="">Selecciona…</option>
                <option value="B2B">B2B</option>
                <option value="B2C">B2C</option>
                <option value="Mixto">Mixto</option>
              </select>
            </div>
          </div>

          <label htmlFor="q1">
            1. En tus palabras, ¿qué entendiste que hace Kumbre Digital y qué
            problema resuelve?
          </label>
          <textarea id="q1" name="q1" required />

          <label htmlFor="q2">
            2. ¿Qué parte del video te dejó más claro el servicio y qué parte te
            dejó dudas?
          </label>
          <textarea id="q2" name="q2" required />

          <label htmlFor="q3">
            3. ¿Qué resultado concreto esperas recibir si contratas este servicio
            por 30 días?
          </label>
          <textarea id="q3" name="q3" required />

          <label htmlFor="q4">
            4. ¿Cuál fue tu primera reacción al escuchar el precio (800 USD/mes) y
            por qué?
          </label>
          <textarea id="q4" name="q4" required />

          <label htmlFor="q5">
            5. ¿Qué tendría que incluir el servicio para que ese precio te parezca
            razonable?
          </label>
          <textarea id="q5" name="q5" required />

          <label htmlFor="q6">
            6. ¿Bajo qué condiciones sí pagarías un retainer mensual por este tipo
            de servicio?
          </label>
          <textarea id="q6" name="q6" required />

          <label htmlFor="q7">
            7. ¿Preferirías un proyecto único o un retainer mensual? Explica por
            qué.
          </label>
          <textarea id="q7" name="q7" required />

          <label htmlFor="q8">
            8. Si tuvieras que proponer un rango mensual “justo” para tu empresa,
            ¿cuál sería y por qué?
          </label>
          <textarea id="q8" name="q8" required />

          <label htmlFor="q9">
            9. ¿Qué información adicional necesitarías para tomar una decisión?
          </label>
          <textarea id="q9" name="q9" required />

          <label htmlFor="q10">
            10. ¿Cuál sería tu siguiente paso después de ver el video (si fuera una
            oferta real)?
          </label>
          <textarea id="q10" name="q10" required />

          <div className="btns">
            <button className="primary" type="submit">
              Enviar respuestas
            </button>
            <button className="ghost" type="button" id="download" onClick={handleDownload}>
              Descargar respuestas (JSON)
            </button>
          </div>

          <div id="status" className="status">
            {status}
          </div>
          <p className="note">
            Privacidad: guarda solo la información necesaria para el análisis.
            Evita pedir datos sensibles.
          </p>
        </form>
      </div>
    </>
  );
}
