# Facial Landmark Selection Tool

An interactive web-based tool to select facial landmarks on an image using MediaPipe's Face Mesh. You can create multiple named areas, select landmarks for each, and copy the landmark indices to your clipboard.

## Features

-   **Interactive Landmark Selection:** Click on the facial landmarks detected by MediaPipe to select them.
-   **Multiple Area Creation:** Organize selected landmarks into different colored areas.
-   **Copy to Clipboard:** Easily copy the indices of selected landmarks for use in other applications.
-   **Responsive Canvas:** The selection canvas adapts to the window size.
-   **Powered by MediaPipe:** Uses the robust Face Mesh model for accurate landmark detection.

## Tech Stack

-   **Backend:** Python with FastAPI to serve the application.
-   **Frontend:** HTML, CSS, and vanilla JavaScript.
-   **Machine Learning:** [Google's MediaPipe Face Mesh](https://developers.google.com/mediapipe/solutions/vision/face_landmarker).

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/mediapipe-landmark-selection.git
    cd mediapipe-landmark-selection
    ```

2.  **Create a virtual environment and install dependencies:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

3.  **Run the application:**
    ```bash
    python server.py
    ```

4.  Open your web browser and navigate to `http://localhost:8000`.

## Usage

1.  **Add a New Area:** Click the "+ New" button to create a new area for selecting landmarks.
2.  **Select an Area:** Click on an area in the list to make it active.
3.  **Select Landmarks:** Click on the dots (landmarks) on the face to add or remove them from the active area. The selected landmarks will be highlighted with the area's color.
4.  **Copy Indices:** Click the copy button on an area to copy the landmark indices to your clipboard.
5.  **Remove an Area:** Click the trash icon to delete an area.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
