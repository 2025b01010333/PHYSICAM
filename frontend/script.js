const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const result = document.getElementById("result");
const loading = document.getElementById("loading");

const previousProblem = document.getElementById("previousProblem");
const previousDetailsContainer = document.getElementById(
  "previousDetailsContainer",
);
const previousDetails = document.getElementById("previousDetails");

// ==================================================
// PREVIOUS PROBLEM
// ==================================================

previousProblem.addEventListener("change", () => {
  if (
    previousProblem.value === "once" ||
    previousProblem.value === "frequent"
  ) {
    previousDetailsContainer.style.display = "block";
  } else {
    previousDetailsContainer.style.display = "none";
    previousDetails.value = "";
  }
});

// ==================================================
// IMAGE PREVIEW
// ==================================================

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];

  if (!file) {
    preview.style.display = "none";
    return;
  }

  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
});

// ==================================================
// ANALYZE IMAGE
// ==================================================

async function analyzeImage() {
  const systemType = document.getElementById("systemType").value;

  const model = document.getElementById("model").value.trim();

  const symptom = document.getElementById("symptom").value.trim();

  const previous = previousProblem.value;

  const previousInfo = previousDetails.value.trim();

  const file = imageInput.files[0];

  // ------------------------------------------------
  // VALIDATION
  // ------------------------------------------------

  if (!systemType) {
    alert("Please select a system type.");
    return;
  }

  if (!symptom) {
    alert("Please describe the problem.");
    return;
  }

  if (!file) {
    alert("Please upload an image.");
    return;
  }

  // ------------------------------------------------
  // FORM DATA
  // ------------------------------------------------

  const formData = new FormData();

  formData.append("file", file);
  formData.append("system_type", systemType);
  formData.append("model", model);
  formData.append("symptom", symptom);
  formData.append("previous_problem", previous);
  formData.append("previous_details", previousInfo);

  // ------------------------------------------------
  // LOADING
  // ------------------------------------------------

  loading.style.display = "block";

  result.innerHTML = "";

  try {
    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    console.log("PHYSICAM RESPONSE:", data);

    if (!response.ok || data.status === "error") {
      throw new Error(data.message || "Analysis failed.");
    }

    // ==================================================
    // POSSIBLE CAUSES
    // ==================================================

    let causesHTML = "";

    if (
      Array.isArray(data.possible_causes) &&
      data.possible_causes.length > 0
    ) {
      causesHTML = `
                <ul class="cause-list">
                    ${data.possible_causes
                      .map((cause) => `<li>${cause}</li>`)
                      .join("")}
                </ul>
            `;
    } else {
      causesHTML = "<p>No specific causes identified.</p>";
    }

    // ==================================================
    // VISUAL EVIDENCE
    // ==================================================

    let visualEvidenceHTML = "";

    if (
      data.visual_evidence_count !== undefined &&
      data.visual_evidence_count > 0
    ) {
      const annotatedImageURL = `http://127.0.0.1:8000${data.annotated_image}`;

      visualEvidenceHTML = `

                <div class="visual-evidence-box">

                    <h3>🔍 Visual Evidence</h3>

                    <p>
                        PHYSICAM detected
                        <strong>
                            ${data.visual_evidence_count}
                        </strong>
                        potential visual evidence region(s).
                    </p>

                    <p>
                        <strong>Evidence Level:</strong>
                        ${data.visual_evidence_level}
                    </p>

                    <img
                        src="${annotatedImageURL}"
                        alt="PHYSICAM Visual Evidence"
                        class="annotated-image"
                    >

                    <p class="evidence-note">
                        🔴 Red boxes indicate regions selected
                        by OpenCV 5 for further inspection.
                        They do not represent a confirmed fault.
                    </p>

                </div>

            `;
    } else {
      visualEvidenceHTML = `

                <div class="visual-evidence-box">

                    <h3>🔍 Visual Evidence</h3>

                    <p>
                        No strong suspicious visual region
                        was detected.
                    </p>

                    <p class="evidence-note">
                        This does not mean the system is definitely
                        healthy. The reported problem may require
                        another image or additional information.
                    </p>

                </div>

            `;
    }

    // ==================================================
    // RESULT PAGE
    // ==================================================

    result.innerHTML = `

            <div class="analysis-result">

                <h2>🧠 PHYSICAM Analysis Result</h2>


                <!-- SYSTEM INFORMATION -->

                <div class="result-section">

                    <h3>⚙️ System Information</h3>

                    <p>
                        <strong>System:</strong>
                        ${data.system_type}
                    </p>

                    ${
                      data.model
                        ? `
                                <p>
                                    <strong>Make / Model:</strong>
                                    ${data.model}
                                </p>
                            `
                        : ""
                    }

                    <p>
                        <strong>Reported Problem:</strong>
                        ${data.symptom}
                    </p>

                    ${
                      data.previous_problem
                        ? `
                                <p>
                                    <strong>Previous Problem:</strong>
                                    ${data.previous_problem}
                                </p>
                            `
                        : ""
                    }

                    ${
                      data.previous_details
                        ? `
                                <p>
                                    <strong>Previous Details:</strong>
                                    ${data.previous_details}
                                </p>
                            `
                        : ""
                    }

                </div>


                <!-- OPENCV METRICS -->

                <div class="result-section">

                    <h3>📊 OpenCV 5 Visual Analysis</h3>

                    <div class="metrics-grid">

                        <div class="metric">
                            <span>Image Size</span>
                            <strong>
                                ${data.image_width}
                                ×
                                ${data.image_height}
                            </strong>
                        </div>


                        <div class="metric">
                            <span>Brightness</span>
                            <strong>
                                ${data.brightness}
                            </strong>
                        </div>


                        <div class="metric">
                            <span>Blur Score</span>
                            <strong>
                                ${data.blur_score}
                            </strong>
                        </div>


                        <div class="metric">
                            <span>Image Quality</span>
                            <strong>
                                ${data.image_quality}
                            </strong>
                        </div>


                        <div class="metric">
                            <span>Edge Density</span>
                            <strong>
                                ${data.edge_density}
                            </strong>
                        </div>


                        <div class="metric">
                            <span>Contours</span>
                            <strong>
                                ${data.contour_count}
                            </strong>
                        </div>


                        <div class="metric">
                            <span>Bright Regions</span>
                            <strong>
                                ${data.bright_region_percentage}%
                            </strong>
                        </div>


                        <div class="metric">
                            <span>Possible Anomaly</span>
                            <strong>
                                ${data.possible_anomaly ? "Yes ⚠️" : "No"}
                            </strong>
                        </div>

                    </div>

                </div>


                <!-- VISUAL EVIDENCE -->

                ${visualEvidenceHTML}


                <!-- DIAGNOSIS -->

                <div class="result-section">

                    <h3>🩺 Diagnosis Status</h3>

                    <p class="diagnosis-status">
                        ${data.diagnosis_status}
                    </p>

                </div>


                <!-- POSSIBLE CAUSES -->

                <div class="result-section">

                    <h3>🔎 Possible Causes</h3>

                    ${causesHTML}

                </div>


                <!-- NEXT STEP -->

                <div class="result-section">

                    <h3>➡️ Recommended Next Step</h3>

                    <p>
                        ${data.next_step}
                    </p>

                </div>


                <!-- SAFETY -->

                <div class="result-section safety-section">

                    <h3>⚠️ Safety</h3>

                    <p>
                        ${data.safety}
                    </p>

                </div>


                <!-- OBSERVATION -->

                <div class="result-section">

                    <h3>👁️ PHYSICAM Observation</h3>

                    <p>
                        ${data.observation}
                    </p>

                </div>


                <!-- SYSTEM MESSAGE -->

                <div class="physicam-message">

                    ${data.message}

                </div>


            </div>

        `;
  } catch (error) {
    console.error("PHYSICAM ERROR:", error);

    result.innerHTML = `

            <div class="error">

                ❌ Unable to analyze the image.

                <br><br>

                Please make sure the PHYSICAM
                backend is running.

                <br><br>

                <small>
                    ${error.message}
                </small>

            </div>

        `;
  } finally {
    loading.style.display = "none";
  }
}
