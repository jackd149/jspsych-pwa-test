const startButton = document.getElementById("start-button");
const startScreen = document.getElementById("start-screen");
const childStartScreen = document.getElementById("child-start-screen");
const childStartButton = document.getElementById("child-start-button");
const studyTarget = document.getElementById("study-target");
const subjectIdInput = document.getElementById("subject-id");
const researcherIdInput = document.getElementById("researcher-id");
const soundCheckButton = document.getElementById("sound-check-button");
const soundCheckAudio = document.getElementById("sound-check-audio");
const soundCheckStatus = document.getElementById("sound-check-status");

soundCheckButton.addEventListener("click", async () => {
  soundCheckAudio.pause();
  soundCheckAudio.currentTime = 0;
  soundCheckStatus.textContent = "";
  try {
    await soundCheckAudio.play();
    soundCheckStatus.textContent = "Adjust the headphone volume. Click Sound check to play again.";
  } catch (error) {
    soundCheckStatus.textContent = "Sound check could not play. Please try again.";
  }
});

function updateStartButton() {
  startButton.disabled = !subjectIdInput.value.trim() || !researcherIdInput.value.trim();
}

subjectIdInput.addEventListener("input", updateStartButton);
researcherIdInput.addEventListener("input", updateStartButton);
window.addEventListener("pageshow", updateStartButton);
updateStartButton();

const VIDEO_FOLDER = "https://raw.githubusercontent.com/efosterhanson/CHS_stims/main/Tablet_Study1_Videos/";
const HOTSPOT_FEEDBACK_CSS = "background-color: rgba(255, 215, 0, 0.35); border: 4px solid #ffd700; border-radius: 12px;";

class ResearcherReview {
  static info = { name: "researcher-review", version: "1.0.0", parameters: {}, data: {} };

  constructor(jsPsych) { this.jsPsych = jsPsych; }

  trial(displayElement) {
    studyTarget.classList.add("researcher-review");
    displayElement.innerHTML = `
      <div class="complete">
        <h2>Study complete</h2>
        <p>Please let a researcher know that you are done.</p>
        <button id="researcher-continue" type="button">Researcher: continue</button>
      </div>`;
    displayElement.querySelector("#researcher-continue").addEventListener("click", () => {
      displayElement.innerHTML = `
        <form id="researcher-review-form" class="researcher-review-form">
          <h2>FOR RESEARCHERS ONLY:</h2>
          <fieldset>
            <legend>Keep data?</legend>
            <label><input type="radio" name="keep_data" value="yes" required /> YES</label>
            <label><input type="radio" name="keep_data" value="no" required /> NO</label>
          </fieldset>
          <label for="researcher-comments">Comments:</label>
          <textarea id="researcher-comments" name="comments" rows="4"></textarea>
          <div class="start-actions">
            <button type="submit">Submit</button>
          </div>
          <p role="status" id="review-save-status"></p>
        </form>`;
      displayElement.querySelector("input").focus();
      const form = displayElement.querySelector("form");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const answers = new FormData(form);
        form.querySelectorAll("button").forEach((button) => { button.disabled = true; });
        displayElement.querySelector("#review-save-status").textContent = "Saving…";
        this.jsPsych.finishTrial({
          keep_data: answers.get("keep_data") === "yes",
          comments: answers.get("comments"),
        });
      });
    });
  }
}

const WARMUP_HOTSPOTS = {
  1: [
    { id: "other", x: 0, y: 0, width: 1280, height: 720 },
    { id: "triangle", x: 148, y: 185, width: 367, height: 350 },
    { id: "red_square", x: 798, y: 195, width: 327, height: 330 },
  ],
  2: [
    { id: "other", x: 0, y: 0, width: 1280, height: 720 },
    { id: "triangle", x: 826, y: 185, width: 368, height: 350 },
    { id: "red_square", x: 164, y: 185, width: 349, height: 350 },
  ],
};

const AGE_HOTSPOTS = [
  ...[3, 4, 5, 6, 7].map((age, index) => ({
    id: String(age), x: 40 + index * 255, y: 145, width: 180, height: 180,
  })),
  ...[8, 9, 10, 11, 12].map((age, index) => ({
    id: String(age), x: 40 + index * 255, y: 395, width: 180, height: 180,
  })),
];

const THREE_CHOICE_AREAS = [
  { x: 10, y: 250, width: 380, height: 215 },
  { x: 450, y: 250, width: 380, height: 215 },
  { x: 895, y: 250, width: 380, height: 215 },
];

const TWO_CHOICE_AREAS = [
  { x: 100, y: 320, width: 460, height: 370 },
  { x: 720, y: 320, width: 460, height: 370 },
];

function twoChoiceHotspots(leftChoice, rightChoice) {
  return [
    { id: leftChoice, ...TWO_CHOICE_AREAS[0] },
    { id: rightChoice, ...TWO_CHOICE_AREAS[1] },
  ];
}

function sizeHotspotVideo() {
  const container = document.getElementById("jspsych-video-hotspots-container");
  const video = document.getElementById("jspsych-video-hotspots-stimulus");
  container.style.zoom = String(Math.min(studyTarget.clientWidth / 1280, studyTarget.clientHeight / 720));
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
}

function videoTrial(filename, trialId) {
  return {
    type: jsPsychVideoButtonResponse,
    stimulus: [`${VIDEO_FOLDER}${filename}`],
    width: 1280,
    height: 720,
    choices: [],
    trial_ends_after_video: true,
    on_load: () => {
      const video = document.getElementById("jspsych-video-button-response-stimulus");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
    },
    data: { trial_id: trialId },
  };
}

function twoChoiceQuestion(filename, trialId, leftChoice, rightChoice) {
  return {
    type: jsPsychVideoHotspots,
    stimulus: `${VIDEO_FOLDER}${filename}`,
    hotspots: twoChoiceHotspots(leftChoice, rightChoice),
    hotspot_highlight_css: HOTSPOT_FEEDBACK_CSS,
    video_preload: false,
    data: { trial_id: trialId, left_choice: leftChoice, right_choice: rightChoice },
    on_load: sizeHotspotVideo,
  };
}

function yesNoQuestion(filename, trialId, version) {
  const choices = version === 1 ? ["Yes", "No"] : ["No", "Yes"];
  return {
    type: jsPsychVideoButtonResponse,
    stimulus: [`${VIDEO_FOLDER}${filename}`],
    width: 1280,
    height: 720,
    choices,
    button_html: (choice) => `<button class="jspsych-btn yes-no-image-button" type="button" aria-label="${choice}"><img src="${VIDEO_FOLDER}${choice.toUpperCase()}.png" alt="${choice}" draggable="false" /></button>`,
    button_layout: "flex",
    response_allowed_while_playing: false,
    trial_ends_after_video: false,
    data: { trial_id: trialId, left_choice: choices[0].toLowerCase(), right_choice: choices[1].toLowerCase() },
    on_load: () => {
      studyTarget.classList.add("yes-no-trial");
      const video = document.getElementById("jspsych-video-button-response-stimulus");
      const buttonGroup = document.getElementById("jspsych-video-button-response-btngroup");
      // Keep the video attached to its original wrapper so playback is not interrupted.
      const stage = video.parentElement;
      stage.classList.add("yes-no-video-stage");
      stage.append(buttonGroup);
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
    },
    on_finish: (data) => {
      data.answer = choices[data.response].toLowerCase();
      studyTarget.classList.remove("yes-no-trial");
    },
  };
}

startButton.addEventListener("click", () => {
  updateStartButton();
  if (startButton.disabled) return;
  soundCheckAudio.pause();
  soundCheckAudio.currentTime = 0;
  startScreen.hidden = true;
  childStartScreen.hidden = false;
  childStartButton.focus();
});

childStartButton.addEventListener("click", async () => {
  const subjectId = subjectIdInput.value.trim();
  const researcherId = researcherIdInput.value.trim();
  if (!subjectId || !researcherId) {
    updateStartButton();
    return;
  }
  childStartButton.disabled = true;
  soundCheckAudio.pause();
  soundCheckAudio.currentTime = 0;

  let jsPsych;
  let resolveReviewSaved;
  const reviewSaved = new Promise((resolve) => { resolveReviewSaved = resolve; });
  try {
    jsPsych = await jsPsychOfflineStorage.initJsPsychOffline({
      display_element: "study-target",
      offline: {
        dbName: "project-sprouts-tablet-study-1",
        autoShowCompletionScreen: false,
        typicalSessionSize: 100 * 1024,
      },
      on_data_update: (data) => {
        // The offline wrapper calls this after committing the trial to IndexedDB.
        if (data.trial_id === "researcher_review") resolveReviewSaved();
      },
      on_finish: async () => {
        await reviewSaved;
        location.reload();
      },
    });
  } catch (error) {
    window.alert(`The study could not start because local data storage is unavailable: ${error.message}`);
    updateStartButton();
    childStartButton.disabled = false;
    return;
  }

  childStartScreen.hidden = true;
  studyTarget.hidden = false;
  jsPsych.data.addProperties({
    session_id: jsPsych.offline.sessionId,
    subject_id: subjectId,
    researcher_id: researcherId,
  });

  const warmupVersion = Math.random() < 0.5 ? 1 : 2;

  function warmupQuestion(filename, trialId) {
    return {
      type: jsPsychVideoHotspots,
      stimulus: `${VIDEO_FOLDER}${filename}`,
      hotspots: WARMUP_HOTSPOTS[warmupVersion],
      hotspot_highlight_css: HOTSPOT_FEEDBACK_CSS,
      video_preload: false,
      data: { trial_id: trialId, warmup_version: warmupVersion },
      on_load: sizeHotspotVideo,
      on_finish: (data) => {
        data.correct = data.hotspot_clicked === "red_square";
      },
    };
  }

  const firstWarmup = warmupQuestion(`warmup_v${warmupVersion}.mp4`, "warmup_initial");
  const retryWarmup = warmupQuestion(`warmup_redo_v${warmupVersion}.mp4`, "warmup_retry");

  const retryIfNeeded = {
    timeline: [retryWarmup],
    conditional_function: () => {
      const firstAnswer = jsPsych.data.get().filter({ trial_id: "warmup_initial" }).last(1).values()[0];
      return firstAnswer?.correct === false;
    },
  };

  const ageQuestion = {
    type: jsPsychVideoHotspots,
    stimulus: `${VIDEO_FOLDER}age.m4v`,
    hotspots: AGE_HOTSPOTS,
    hotspot_highlight_css: HOTSPOT_FEEDBACK_CSS,
    video_preload: false,
    data: { trial_id: "age" },
    on_load: sizeHotspotVideo,
    on_finish: (data) => {
      data.age_years = Number(data.hotspot_clicked);
    },
  };

  const sarcaCondition = Math.random() < 0.5 ? "A" : "B";
  const sarcaVersion = Math.random() < 0.5 ? 1 : 2;
  const glorpVersion = Math.random() < 0.5 ? 1 : 2;
  const closenessVersion = Math.random() < 0.5 ? 1 : 2;
  const trial3Version = Math.random() < 0.5 ? 1 : 2;
  const trial4Version = Math.random() < 0.5 ? 1 : 2;
  jsPsych.data.addProperties({
    sarca_condition: sarcaCondition,
    sarca_video_version: sarcaVersion,
    glorp_video_version: glorpVersion,
    closeness_video_version: closenessVersion,
    trial3_video_version: trial3Version,
    trial4_video_version: trial4Version,
  });

  const sarcaChoices = sarcaCondition === "A" ? ["ant", "grass"] : ["bee", "grass"];
  const sarcaLeft = sarcaVersion === 1 ? sarcaChoices[0] : sarcaChoices[1];
  const sarcaRight = sarcaVersion === 1 ? sarcaChoices[1] : sarcaChoices[0];
  const glorpLeft = glorpVersion === 1 ? "oak_tree" : "kangaroo";
  const glorpRight = glorpVersion === 1 ? "kangaroo" : "oak_tree";
  const closenessChoices = closenessVersion === 1
    ? ["really_far", "sort_of_close", "really_close"]
    : ["really_close", "sort_of_close", "really_far"];
  const closenessQuestion = {
    type: jsPsychVideoHotspots,
    stimulus: `${VIDEO_FOLDER}closenesstonature_affect_v${closenessVersion}.m4v`,
    hotspots: THREE_CHOICE_AREAS.map((area, index) => ({ id: closenessChoices[index], ...area })),
    hotspot_highlight_css: HOTSPOT_FEEDBACK_CSS,
    video_preload: false,
    data: { trial_id: "closeness_to_nature" },
    on_load: sizeHotspotVideo,
  };
  const scaleChoices = trial3Version === 1
    ? ["not_at_all", "sometimes", "a_lot"]
    : ["a_lot", "sometimes", "not_at_all"];
  function scaleQuestion(filename, trialId) {
    return {
      type: jsPsychVideoHotspots,
      stimulus: `${VIDEO_FOLDER}${filename}`,
      hotspots: THREE_CHOICE_AREAS.map((area, index) => ({ id: scaleChoices[index], ...area })),
      hotspot_highlight_css: HOTSPOT_FEEDBACK_CSS,
      video_preload: false,
      data: { trial_id: trialId },
      on_load: sizeHotspotVideo,
    };
  }

  jsPsych.run([
    // Trial 1
    videoTrial("hello2.mp4", "hello_intro"),
    firstWarmup,
    retryIfNeeded,
    //videoTrial("warmup_end.mp4", "warmup_end")
    videoTrial("play_for_real.mp4", "play_for_real"),
    ageQuestion,
    twoChoiceQuestion(`ind_sarca_${sarcaCondition}_v${sarcaVersion}.m4v`, "sarca", sarcaLeft, sarcaRight),
    twoChoiceQuestion(`glorp_v${glorpVersion}.mp4`, "glorp", glorpLeft, glorpRight),
    // Trial 2
    closenessQuestion,
    // Trial 3
    videoTrial(`practice_warmup_v${trial3Version}.mp4`, "practice_warmup_intro"),
    scaleQuestion(`practice_birds_fly_v${trial3Version}.m4v`, "practice_birds_fly"),
    videoTrial(`practice_birds_fly_feedback_v${trial3Version}.mp4`, "practice_birds_fly_feedback"),
    scaleQuestion(`practice_animals_lay_eggs_v${trial3Version}.m4v`, "practice_animals_lay_eggs"),
    videoTrial(`practice_animals_lay_eggs_feedback_v${trial3Version}.mp4`, "practice_animals_lay_eggs_feedback"),
    scaleQuestion(`practice_bird_car_v${trial3Version}.m4v`, "practice_bird_car"),
    videoTrial(`practice_bird_car_feedback_v${trial3Version}.mp4`, "practice_bird_car_feedback"),
    videoTrial("play_for_real.mp4", "attitude_intro"),
    scaleQuestion(`mor_tree_important_v${trial3Version}.m4v`, "tree_important"),
    scaleQuestion(`mor_bug_important_v${trial3Version}.m4v`, "bug_important"),
    scaleQuestion(`mor_tree_protect_v${trial3Version}.m4v`, "tree_protect"),
    scaleQuestion(`mor_bug_protect_v${trial3Version}.m4v`, "bug_protect"),
    scaleQuestion(`exp_time_v${trial3Version}.m4v`, "time"),
    scaleQuestion(`exp_books_shows_v${trial3Version}.m4v`, "books"),
    // Trial 4
    videoTrial("mem_intro.mp4", "mem_intro"),
    yesNoQuestion(`eco_sarca_${sarcaCondition}_v${trial4Version}.mp4`, "eco_sarca", trial4Version),
    yesNoQuestion(`eco_glorp_v${trial4Version}.mp4`, "eco_glorp", trial4Version),
    yesNoQuestion(`kind_sarca_v${trial4Version}.mp4`, "kind_sarca", trial4Version),
    yesNoQuestion(`kind_glorp_v${trial4Version}.mp4`, "kind_glorp", trial4Version),
    // Ending
    videoTrial("thanksforplaying_audio.mp4", "study_end"),
    { type: ResearcherReview, data: { trial_id: "researcher_review" } },
  ]);
});
