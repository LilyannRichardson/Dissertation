var jsPsychHtmlSliderResponseUnlimited = (function (jspsych) {
  'use strict';

  var version = "2.0.0";

  const info = {
    name: "html-slider-response-unlimited",
    version,
    parameters: {
      /** The HTML string to be displayed */
      stimulus: {
        type: jspsych.ParameterType.HTML_STRING,
        default: void 0
      },
      /** Sets the minimum value of the slider. */
      min: {
        type: jspsych.ParameterType.INT,
        default: 0
      },
      /** Sets the maximum value of the slider */
      max: {
        type: jspsych.ParameterType.INT,
        default: 100
      },
      /** Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the other two will be at 33% and 67% of the slider width. */
      labels: {
        type: jspsych.ParameterType.HTML_STRING,
        default: [],
        array: true
      },
      /** Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in the display. */
      slider_width: {
        type: jspsych.ParameterType.INT
      },
      /** Label of the button to end the trial. */
      button_label: {
        type: jspsych.ParameterType.STRING,
        default: "Continue",
        array: false
      },
      /** If true, the participant must move the slider before clicking the continue button. */
      require_movement: {
        type: jspsych.ParameterType.BOOL,
        default: false
      },
      /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        default: null
      },
      /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends. */
      stimulus_duration: {
        type: jspsych.ParameterType.INT,
        default: null
      },
      /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely. */
      trial_duration: {
        type: jspsych.ParameterType.INT,
        default: null
      },
      /** If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete. */
      response_ends_trial: {
        type: jspsych.ParameterType.BOOL,
        default: true
      }
    },
    data: {
      /** The time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
      rt: {
        type: jspsych.ParameterType.INT
      },
      /** The numeric value of the slider. */
      response: {
        type: jspsych.ParameterType.INT
      },
      /** The HTML content that was displayed on the screen. */
      stimulus: {
        type: jspsych.ParameterType.HTML_STRING
      },
      /** The starting value of the slider. */
      slider_start: {
        type: jspsych.ParameterType.INT
      }
    }
  };
  class HtmlSliderResponseUnlimitedPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    static {
      this.info = info;
    }
    trial(display_element, trial) {
      var slider_value = null;
      var slider_control_width = 10;
      var half_thumb_width = 7.5;
      var html = '<div id="jspsych-html-slider-response-wrapper" style="margin: 100px 0px;">';
      html += '<div id="jspsych-html-slider-response-stimulus" style="padding-bottom: 50px">' + trial.stimulus + "</div>";
      html += '<div class="jspsych-html-slider-response-container" style="position:relative; margin: 0 auto 3em auto; ';
      html += "width:" + trial.slider_width + "px;";
      html += '">';
      //html += '<input type="range" class="jspsych-slider" value="' + trial.slider_start + '" min="' + trial.min + '" max="' + trial.max + '" step="' + trial.step + '" id="jspsych-html-slider-response-response"></input>';
      html += `
<div style="background: grey; height: 10px; border: 1px solid black; border-radius: 4px" id="jspsych-html-slider-response-response">
  <div 
    style="background: white; border: 1px solid black; border-radius: 4px; width: ${slider_control_width}px; height: 20px; position: absolute; top: -5px; left: ${trial.slider_width / 2 - slider_control_width / 2}px"
    id="jspsych-html-slider-response-slider-control">
  </div>
</div>`;
      html += "<div>";
      for (var j = 0; j < trial.labels.length; j++) {
        var label_width_perc = 100 / (trial.labels.length - 1);
        var percent_of_range = j * (100 / (trial.labels.length - 1));
        var percent_dist_from_center = (percent_of_range - 50) / 50 * 100;
        var offset = percent_dist_from_center * half_thumb_width / 100;
        html += '<div style="border: 1px solid transparent; display: inline-block; position: absolute; left:calc(' + percent_of_range + "% - (" + label_width_perc + "% / 2) - " + offset + "px); text-align: center; width: " + label_width_perc + '%;">';
        html += '<span style="text-align: center; font-size: 80%;">' + trial.labels[j] + "</span>";
        html += "</div>";
      }
      html += "</div>";
      html += "</div>";
      html += "</div>";
      if (trial.prompt !== null) {
        html += trial.prompt;
      }
      html += '<button id="jspsych-html-slider-response-next" class="jspsych-btn" ' + (trial.require_movement ? "disabled" : "") + ">" + trial.button_label + "</button>";
      display_element.innerHTML = html;
      var response = {
        rt: null,
        response: null
      };
      if (trial.require_movement) {
        const enable_button = () => {
          display_element.querySelector(
            "#jspsych-html-slider-response-next"
          ).disabled = false;
        };
        display_element.querySelector("#jspsych-html-slider-response-response").addEventListener("mousedown", enable_button);
        display_element.querySelector("#jspsych-html-slider-response-response").addEventListener("touchstart", enable_button);
        display_element.querySelector("#jspsych-html-slider-response-response").addEventListener("change", enable_button);
      }
      const end_trial = () => {
        var trialdata = {
          rt: response.rt,
          stimulus: trial.stimulus,
          slider_start: trial.slider_start,
          response: response.response
        };
        this.jsPsych.finishTrial(trialdata);
      };
      var body = document.getElementsByTagName("body").item(0);
      function handleSliderClick(e) {
        var endTime = performance.now();
        response.rt = Math.round(endTime - startTime);
        var body_x = document.getElementsByTagName("body")[0].getBoundingClientRect().x;
        var click_x = e.clientX;
        var slider_bar_rect = display_element.querySelector("#jspsych-html-slider-response-response").getBoundingClientRect();
        var slider_bar_x = slider_bar_rect.x;
        var slider_bar_width = slider_bar_rect.width;
        //console.log(`body_x: ${body_x}, click_x: ${click_x}, slider_bar_x: ${slider_bar_x}, slider_bar_width: ${slider_bar_width}`);
        // move the slider!
        var slider_bar_slider = document.getElementById("jspsych-html-slider-response-slider-control");
        var slider_control_x = click_x - slider_bar_x; // centre of control
        var slider_control_left = slider_control_x - slider_control_width / 2; // left edge of control
        slider_bar_slider.style.left = `${slider_control_left}px`;
        // calc slider value
        response.response = trial.min + (trial.max - trial.min) * (slider_control_x / slider_bar_width);
        //console.log(`${response.response}`);
        if (trial.response_ends_trial) {
          end_trial();
        } else {
          display_element.querySelector("#jspsych-html-slider-response-next").disabled = false;
        }
      }
      body.addEventListener("click", handleSliderClick, false); // handle on bubbling so Continue button works
      document.getElementById("jspsych-html-slider-response-next").addEventListener("click", end_trial);
      if (trial.stimulus_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          display_element.querySelector(
            "#jspsych-html-slider-response-stimulus"
          ).style.visibility = "hidden";
        }, trial.stimulus_duration);
      }
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
      }
      var startTime = performance.now();
    }
    simulate(trial, simulation_mode, simulation_options, load_callback) {
      if (simulation_mode == "data-only") {
        load_callback();
        this.simulate_data_only(trial, simulation_options);
      }
      if (simulation_mode == "visual") {
        this.simulate_visual(trial, simulation_options, load_callback);
      }
    }
    create_simulation_data(trial, simulation_options) {
      const default_data = {
        stimulus: trial.stimulus,
        slider_start: trial.slider_start,
        response: this.jsPsych.randomization.randomInt(trial.min, trial.max),
        rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true)
      };
      const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
      this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
      return data;
    }
    simulate_data_only(trial, simulation_options) {
      const data = this.create_simulation_data(trial, simulation_options);
      this.jsPsych.finishTrial(data);
    }
    simulate_visual(trial, simulation_options, load_callback) {
      const data = this.create_simulation_data(trial, simulation_options);
      const display_element = this.jsPsych.getDisplayElement();
      this.trial(display_element, trial);
      load_callback();
      if (data.rt !== null) {
        const el = display_element.querySelector("input[type='range']");
        setTimeout(() => {
          this.jsPsych.pluginAPI.clickTarget(el);
          el.valueAsNumber = data.response;
        }, data.rt / 2);
        this.jsPsych.pluginAPI.clickTarget(display_element.querySelector("button"), data.rt);
      }
    }
  }

  return HtmlSliderResponseUnlimitedPlugin;

})(jsPsychModule);
//# sourceMappingURL=index.browser.js.map