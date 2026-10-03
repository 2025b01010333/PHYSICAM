const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const result = document.getElementById("result");
const loading = document.getElementById("loading");

const previousProblem = document.getElementById("previousProblem");
const previousDetailsContainer = document.getElementById(
  "previousDetailsContainer",
);
const previousDetails = document.getElementById("previousDetails");

// --------------------------------------------------
// Previous Problem Selection
// --------------------------------------------------

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

// --------------------------------------------------
// Image Preview
// --------------------------------------------------

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];

  if (!file) {
    preview.style.display = "none";
    return;
  }

  const imageURL = URL.createObjectURL(file);

  preview.src = imageURL;
  preview.style.display = "block";
});

// --------------------------------------------------
// Analyze Image
// --------------------------------------------------

async function analyzeImage() {
  const systemType = document.getElementById("systemType").value;

  const model = document.getElementById("model").value.trim();

  const symptom = document.getElementById("symptom").value.trim();

  const previous = previousProblem.value;

  const previousInfo = previousDetails.value.trim();

  const file = imageInput.files[0];

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Form Data
  // --------------------------------------------------

  const formData = new FormData();

  formData.append("file", file);
  formData.append("system_type", systemType);
  formData.append("model", model);
  formData.append("symptom", symptom);
  formData.append("previous_problem", previous);
  formData.append("previous_details", previousInfo);

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  loading.style.display = "block";

  result.innerHTML = "";

  try {
    // --------------------------------------------------
    // Backend Request
    // --------------------------------------------------

    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || data.status === "error") {
      throw new Error(data.message || "Analysis failed.");
    }

    // --------------------------------------------------
    // Possible Causes
    // --------------------------------------------------

    let causesHTML = "";

    if (data.possible_causes && data.possible_causes.length > 0) {
      causesHTML = `
                <ul>
                    ${data.possible_causes
                      .map((cause) => `<li>${cause}</li>`)
                      .join("")}
                </ul>
            `;
    } else {
      causesHTML = "<p>No specific causes identified.</p>";
    }

    // --------------------------------------------------
    // Visual Evidence
    // --------------------------------------------------

    let visualEvidenceHTML = "";

    if (data.visual_evidence_count > 0) {
      const annotatedImageURL = `http://127.0.0.1:8000${data.annotated_image}`;

      visualEvidenceHTML = `
                <div class="visual-evidence-section">

                    <h3>🔍 Visual Evidence</h3>

                    <p>
                        PHYSICAM detected
                        <strong>${data.visual_evidence_count}</strong>
                        potential visual evidence region(s).
                    </p>

                    <p>
                        Evidence level:
                        <strong>
                            ${data.visual_evidence_level}
                        </strong>
                    </p>

                    <img
                        src="${annotatedImageURL}"
                        alt="PHYSICAM visual evidence"
                        class="annotated-image"
                    >

                    <p class="evidence-note">
                        Red boxes indicate regions selected by
                        OpenCV 5 for further inspection. They do not
                        represent a confirmed fault.
                    </p>

                </div>
            `;
    } else {
      visualEvidenceHTML = `
                <div class="visual-evidence-section">

                    <h3>🔍 Visual Evidence</h3>

                    <p>
                        No strong suspicious visual region was detected
                        in this image.
                    </p>

                    <p class="evidence-note">
                        This does not mean that the system is definitely
                        healthy. The reported problem may require another
                        image or additional information.
                    </p>

                </div>
            `;
    }

    // --------------------------------------------------
    // Result
    // --------------------------------------------------

    result.innerHTML = `

            <div class="analysis-result">

                <h2>🧠 PHYSICAM Analysis</h2>


                <div class="system-info">

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


                <hr>


                <h3>📊 OpenCV 5 Evidence</h3>

                <div class="metrics">

                    <p>
                        <strong>Image:</strong>
                        ${data.image_width} × ${data.image_height}
                    </p>

                    <p>
                        <strong>Brightness:</strong>
                        ${data.brightness}
                    </p>

                    <p>
                        <strong>Blur Score:</strong>
                        ${data.blur_score}
                    </p>

                    <p>
                        <strong>Image Quality:</strong>
                        ${data.image_quality}
                    </p>

                    <p>
                        <strong>Edge Density:</strong>
                        ${data.edge_density}
                    </p>

                    <p>
                        <strong>Contours:</strong>
                        ${data.contour_count}
                    </p>

                    <p>
                        <strong>Bright Region:</strong>
                        ${data.bright_region_percentage}%
                    </p>

                    <p>
                        <strong>Possible Anomaly:</strong>
                        ${data.possible_anomaly ? "Yes" : "No"}
                    </p>

                </div>


                ${visualEvidenceHTML}


                <hr>


                <h3>🩺 Diagnosis Status</h3>

                <p>
                    <strong>
                        ${data.diagnosis_status}
                    </strong>
                </p>


                <h3>🔎 Possible Causes</h3>

                ${causesHTML}


                <h3>➡️ Recommended Next Step</h3>

                <p>
                    ${data.next_step}
                </p>


                <h3>⚠️ Safety</h3>

                <p>
                    ${data.safety}
                </p>


                <div class="observation">

                    <strong>👁️ Observation:</strong>

                    <p>
                        ${data.observation}
                    </p>

                </div>


                <div class="message">

                    ${data.message}

                </div>

            </div>

        `;
  } catch (error) {
    console.error(error);

    result.innerHTML = `
            <div class="error">
                ❌ Unable to analyze the image.

                <br><br>

                Please make sure the PHYSICAM backend is running.
            </div>
        `;
  } finally {
    loading.style.display = "none";
  }
}
