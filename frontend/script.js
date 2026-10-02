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

// Send image to backend
async function analyzeImage() {
  const file = imageInput.files[0];

  if (!file) {
    alert("Please select an image first.");
    return;
  }

  const formData = new FormData();

  formData.append("file", file);

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
