const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const result = document.getElementById("result");
const loading = document.getElementById("loading");

// Show image preview
imageInput.addEventListener("change", function () {
  const file = imageInput.files[0];

  if (!file) {
    preview.style.display = "none";
    return;
  }

  const imageURL = URL.createObjectURL(file);

  preview.src = imageURL;
  preview.style.display = "block";
});

// Send problem information to backend
async function analyzeImage() {
  const file = imageInput.files[0];

  const systemType = document.getElementById("systemType").value;

  const symptom = document.getElementById("symptom").value;

  // Check system type
  if (!systemType) {
    alert("Please select the system you want to diagnose.");
    return;
  }

  // Check symptom
  if (!symptom.trim()) {
    alert("Please describe what happened.");
    return;
  }

  // Check image
  if (!file) {
    alert("Please upload an image.");
    return;
  }

  // Prepare data
  const formData = new FormData();

  formData.append("file", file);

  formData.append("system_type", systemType);

  formData.append("symptom", symptom);

  // Show loading
  loading.style.display = "block";

  result.style.display = "none";

  try {
    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    result.style.display = "block";

    if (data.status === "success") {
      result.innerHTML = `

                <h3>OpenCV Analysis</h3>

                <p>
                    <strong>System:</strong>
                    ${systemType}
                </p>

                <p>
                    <strong>Problem:</strong>
                    ${symptom}
                </p>

                <p>
                    <strong>File:</strong>
                    ${data.filename}
                </p>

                <p>
                    <strong>Image Size:</strong>
                    ${data.image_width} × ${data.image_height}
                </p>

                <p>
                    <strong>Brightness:</strong>
                    ${data.brightness}
                </p>

                <p>
                    <strong>Edge Density:</strong>
                    ${data.edge_density}
                </p>

                <p>
                    <strong>Contours Detected:</strong>
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

                <p>
    <strong>Observation:</strong>
    ${data.observation}
</p>

<p>
    <strong>Diagnosis Status:</strong>
    ${data.diagnosis_status}
</p>

<p>
    <strong>Possible Causes:</strong>
</p>

<ul>
    ${data.possible_causes.map((cause) => `<li>${cause}</li>`).join("")}
</ul>

<p>
    <strong>Recommended Next Step:</strong>
    ${data.next_step}
</p>

<p>
    <strong>Safety:</strong>
    ${data.safety}
</p>

<p>
    ${data.message}
</p>

            `;
    } else {
      result.innerHTML = `
                <p>${data.message}</p>
            `;
    }
  } catch (error) {
    result.style.display = "block";

    result.innerHTML = `
            <p>
                Could not connect to PHYSICAM backend.
                Make sure the FastAPI server is running.
            </p>
        `;

    console.error(error);
  } finally {
    loading.style.display = "none";
  }
}
