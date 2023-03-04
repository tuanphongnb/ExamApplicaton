//selecting all required elements
const start_quiz = document.querySelector(".start_quiz");
const start_btn = document.querySelector(".start_quiz .start_btn button");
const info_box = document.querySelector(".info_box");
const exit_btn = info_box.querySelector(".buttons .quit");
const continue_btn = info_box.querySelector(".buttons .restart");
const quiz_box = document.querySelector(".quiz_box");
const result_box = document.querySelector(".result_box");
const option_list = document.querySelector(".option_list");
const time_line = document.querySelector("header .time_line");
const timeText = document.querySelector(".timer .time_left_txt");
const timeCount = document.querySelector(".timer .timer_sec");
const student_name = document.querySelector(".start_quiz .input-group #student_name");
const section_quiz = document.querySelector(".quiz_box #sectionQuiz");
const select_Exam = document.querySelector(".start_quiz .exam .exam_name");
let que_count = 0;
let que_numb = 1;
let userScore = 0;
let counter;
let counterLine;
let widthValue = 0;
var questions = [];
let exams = [];
let exam_selected;
let exam_selected_name;
// if startQuiz button clicked

start_quiz.addEventListener("submit", submitForm);
function submitForm(e){
    e.preventDefault();
    // timeCount.innerHTML = timeCount.innerHTML;
    // $(quiz_box)[0].reset();
    start_quiz.classList.remove("activeInfo");
    info_box.classList.add("activeInfo"); //show info box
}

// if exitQuiz button clicked
exit_btn.onclick = ()=>{
    // info_box.classList.remove("activeInfo"); //hide info box
    // start_quiz.classList.add("activeInfo");
    window.location.reload(); //reload the current window
}

// if continueQuiz button clicked
continue_btn.onclick = ()=>{
    info_box.classList.remove("activeInfo"); //hide info box
    quiz_box.classList.add("activeQuiz"); //show quiz box
    showQuetions(0, continue_btn_callBack); //calling showQestions function

}

continue_btn_callBack = () => {
    queCounter(1); //passing 1 parameter to queCounter
    startTimer(timeCount.innerHTML); //calling startTimer function
    startTimerLine(0); //calling startTimerLine function
}


const restart_quiz = result_box.querySelector(".buttons .restart");
const quit_quiz = result_box.querySelector(".buttons .quit");

// if restartQuiz button clicked
restart_quiz.onclick = ()=>{
    quiz_box.classList.add("activeQuiz"); //show quiz box
    result_box.classList.remove("activeResult"); //hide result box
    showQuetions(0, restart_quiz_callBack); //calling showQestions function
}

restart_quiz_callBack = () => {
    que_count = 0;
    que_numb = 1;
    userScore = 0;
    widthValue = 0;
    queCounter(que_numb); //passing que_numb value to queCounter
    clearInterval(counter); //clear counter
    clearInterval(counterLine); //clear counterLine
    startTimer(timeCount.innerHTML); //calling startTimer function
    startTimerLine(widthValue); //calling startTimerLine function
    timeText.textContent = "Time Left"; //change the text of timeText to Time Left
}

// if quitQuiz button clicked
quit_quiz.onclick = ()=>{
    window.location.reload(); //reload the current window
}

const next_btn = document.querySelector("footer .next_btn");
const prev_btn = document.querySelector("footer .prev_btn");
const bottom_ques_counter = document.querySelector("footer .total_que");

// if Next Que button clicked
next_btn.onclick = ()=>{
    if(que_count < questions.length - 1){ //if question count is less than total question length
        que_count++; //increment the que_count value
        que_numb++; //increment the que_numb value
        loadQuestions(que_count); //calling showQestions function
        queCounter(que_numb); //passing que_numb value to queCounter
        // clearInterval(counter); //clear counter
        // clearInterval(counterLine); //clear counterLine
        // startTimer(timeCount.innerHTML); //calling startTimer function
        // startTimerLine(widthValue); //calling startTimerLine function
        timeText.textContent = "Time Left"; //change the timeText to Time Left
    }
    else{
        clearInterval(counter); //clear counter
        clearInterval(counterLine); //clear counterLine
        showResult(); //calling showResult function
    }
}

// if Prev Que button clicked
prev_btn.onclick = ()=>{
    if(0 < que_count < questions.length - 1){ //if question count is less than total question length
        que_count--; //increment the que_count value
        que_numb--; //increment the que_numb value
        loadQuestions(que_count); //calling showQestions function
        queCounter(que_numb); //passing que_numb value to queCounter
        // clearInterval(counter); //clear counter
        // clearInterval(counterLine); //clear counterLine
        // startTimer(timeCount.innerHTML); //calling startTimer function
        // startTimerLine(widthValue); //calling startTimerLine function
        timeText.textContent = "Time Left"; //change the timeText to Time Left
    }
}

// getting questions and options from array
function showQuetions(index, callback){
    exam_selected = $(select_Exam).find(":selected").val();
    exam_selected_name = $(select_Exam).find(":selected").text();
    exams.forEach(exam => {
        if (exam["id"] == exam_selected) {
            timeCount.innerHTML = exam["count_down_time"];
            return;
        }
    });
	$.ajax({
        url: '/loadQuestions',
        // dataType: "jsonp",
        data: {
            'examId': exam_selected
        },
        type: 'POST',
        jsonpCallback: 'callback', // this is not relevant to the POST anymore
        success: function (res) {
            // var res = jQuery.parseJSON(data);
            // $('#lblResponse').html(res.msg);
            // res.forEach((item) => item.answer_user = "");
            // localStorage.setItem("questions", JSON.stringify(res));
            questions = res;
            loadQuestions(index);
            callback();
            console.log('Success: ')
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
            $('#lblResponse').html('Error connecting to the server.');
        },
    });
    
}

function loadQuestions(index){
    const que_text = document.querySelector(".que_text");
    prev_btn.disabled = false;
    prev_btn.classList.remove("disabled");
    //creating a new span and div tag for question and option and passing the value using array index
    var que_tag = '<span>'+ questions[index].num + ". " + questions[index].question +'</span>';
    var option_tag = [];
    var column_answer = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K","L", "M",
                         "N", "O", "P", "Q", "R","S", "T", "U", "V", "W", "X", "Y", "Z"]
    Object.keys(questions[index]).forEach(col => {
        if (column_answer.includes(col.replaceAll("Answer_", "")) && questions[index].answer_user == undefined) {
            optionAnswer = "<div class= 'option'><label>" +
            "<input type='radio' class='form-check-input' name='option' id='"+col+"' value='" + questions[index][col] 
            + "'><span id='optionval'>" + questions[index][col] + "</span></label></div>";
            // option_tag.push('<div class="option"><span>'+ questions[index][col] +'</span></div>');
            option_tag.push(optionAnswer);
        }
        if (column_answer.includes(col.replaceAll("Answer_", "")) && questions[index].answer_user != undefined && questions[index][col] != questions[index].answer_user) {
            optionAnswer = "<div class= 'option'><label>" +
            "<input type='radio' class='form-check-input' name='option' id='"+col+"' value='" + questions[index][col] 
            + "'><span id='optionval'>" + questions[index][col] + "</span></label></div>";
            // option_tag.push('<div class="option"><span>'+ questions[index][col] +'</span></div>');
            option_tag.push(optionAnswer);
        }
        if (column_answer.includes(col.replaceAll("Answer_", "")) && questions[index].answer_user != undefined && questions[index][col] == questions[index].answer_user) {
            optionAnswer = "<div class= 'option'><label>" +
            "<input type='radio' class='form-check-input' name='option' id='"+col+"' value='" + questions[index][col] +"' checked='checked'"
            + "'><span id='optionval'>" + questions[index][col] + "</span></label></div>";
            // option_tag.push('<div class="option"><span>'+ questions[index][col] +'</span></div>');
            option_tag.push(optionAnswer);
        }
    });

    que_text.innerHTML = que_tag; //adding new span tag inside que_tag
    option_list.innerHTML = option_tag.join(""); //adding new div tag inside option_tag
    
    const option = option_list.querySelectorAll(".option input");
    if (index <= 0 ) {
        prev_btn.disabled = true;
        prev_btn.classList.add("disabled")
    }
    // if(index >= questions.length -1 ){
    //     next_btn.disabled = true;
    // }
    // set onclick attribute to all available options
    for(i=0; i < option.length; i++){
        option[i].setAttribute("onclick", "optionSelected(this)");
    }
}

function importQuestions(){
    $.ajax({
        url: '/importQuestions',
        // dataType: "jsonp",
        data: {
            'city': 'pune',
            'country': 'India'
        },
        type: 'POST',
        jsonpCallback: 'callback', // this is not relevant to the POST anymore
        success: function (res) {
            // var res = jQuery.parseJSON(data);
            // $('#lblResponse').html(res.msg);
            console.log('Success: ')
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
            $('#lblResponse').html('Error connecting to the server.');
        },
    });
}

// function importQuestions(){
// 	$.support.cors = true;  
// 	var request = new XMLHttpRequest();
// 	// may be necessary to escape path string?
// 	request.open("GET", "/resource/table_convert_json.xlsx", true);
// 	request.responseType = "arraybuffer";
// 	request.onload = function () {
//     // this.response should be `ArrayBuffer` of `.xlsx` file
//     // var file = new File(this.response, "Fiverr_Example_List.xlsx");
// 	var a= this.response;
// 	var filename = this.response.name;
//     // do stuff with `file`
//   };
//   request.send();
// }

// creating the new div tags which for icons
let tickIconTag = '<div class="icon tick"><i class="fas fa-check"></i></div>';
let crossIconTag = '<div class="icon cross"><i class="fas fa-times"></i></div>';

//if user clicked on option
function optionSelected(answer){
    // clearInterval(counter); //clear counter
    // clearInterval(counterLine); //clear counterLine
    let userAns = answer.id; //getting user selected option
    // let correcAns = questions[que_count][questions[que_count].answer_correct]; //getting correct answer from array
    questions[que_count].answer_user = userAns;
    // const allOptions = option_list.children.length; //getting all option items
    
    // if(userAns == correcAns){ //if user selected option is equal to array's correct answer
    //     userScore += 1; //upgrading score value with 1
    //     // answer.classList.add("correct"); //adding green color to correct selected option
    //     // answer.insertAdjacentHTML("beforeend", tickIconTag); //adding tick icon to correct selected option
    //     console.log("Correct Answer");
    //     console.log("Your correct answers = " + userScore);
    // }else{
    //     // answer.classList.add("incorrect"); //adding red color to correct selected option
    //     // answer.insertAdjacentHTML("beforeend", crossIconTag); //adding cross icon to correct selected option
    //     console.log("Wrong Answer");

    //     for(i=0; i < allOptions; i++){
    //         if(option_list.children[i].textContent == correcAns){ //if there is an option which is matched to an array answer 
    //             // option_list.children[i].setAttribute("class", "option correct"); //adding green color to matched option
    //             // option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag); //adding tick icon to matched option
    //             // console.log("Auto selected correct answer.");
    //         }
    //     }
    // }
    // for(i=0; i < allOptions; i++){
    //     option_list.children[i].classList.add("disabled"); //once user select an option then disabled all options
    // }
    // next_btn.classList.add("show"); //show the next button if user selected any option
}

function showResult(){
    preCalculatorResult();
    $.ajax({
        url: '/processResult',
        data: {
            'examName': exam_selected_name,
            'studentName': student_name.value,
            'examResultDetails': questions,
            'studentScore': userScore
        },
        type: 'POST',
        jsonpCallback: 'callback', // this is not relevant to the POST anymore
        success: function (res) {
            showCalculatorResult();
            $.toast({ 
                text : "Hoàn thành", 
                bgColor : 'green',              // Background color for toast
                textColor : '#eee',            // text color
                allowToastClose : true,       // Show the close button or not
                hideAfter : 5000,              // `false` to make it sticky or time in miliseconds to hide after
                textAlign : 'left',            // Alignment of text i.e. left, right, center
                position : 'bottom-right'       // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values to position the toast on page
              });
        },
        error: function (xhr, status, error) {
            $.toast({ 
                text : xhr.responseJSON.message, 
                bgColor : 'red',              // Background color for toast
                textColor : '#eee',            // text color
                allowToastClose : true,       // Show the close button or not
                hideAfter : 5000,              // `false` to make it sticky or time in miliseconds to hide after
                textAlign : 'left',            // Alignment of text i.e. left, right, center
                position : 'bottom-right'       // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values to position the toast on page
              });
              setTimeout(() => {window.location.reload()}, 5000);
             
        },
    });
}

function preCalculatorResult(){
    for (let index = 0; index < questions.length; index++) {
        var correcAns = questions[index].answer_correct; //getting correct answer from array
        if (questions[index].answer_user == correcAns) {
            userScore ++; //if user selected option is equal to array's correct answer
        }
    }
}

function showCalculatorResult(){
    info_box.classList.remove("activeInfo"); //hide info box
    quiz_box.classList.remove("activeQuiz"); //hide quiz box
    result_box.classList.add("activeResult"); //show result box
    const scoreText = result_box.querySelector(".score_text");
    if (userScore > 3){ // if user scored more than 3
        //creating a new span tag and passing the user score number and total question number
        let scoreTag = '<span>Xin chúc mừng! 🎉, bạn có ' + userScore + ' câu trả lời đúng trên tổng số ' + questions.length + ' câu hỏi</span>';
        scoreText.innerHTML = scoreTag;  //adding new span tag inside score_Text
    }
    else if(userScore > 0){ // if user scored more than 1
        let scoreTag = '<span>Tốt 😎, bạn có ' + userScore + ' câu trả lời đúng trên tổng số ' + questions.length + ' câu hỏi</span>';
        scoreText.innerHTML = scoreTag;
    }
    else{ // if user scored less than 1
        let scoreTag = '<span>Xin lỗi 😐, bạn có ' + userScore + ' câu trả lời đúng trên tổng số ' + questions.length + ' câu hỏi</span>';
        scoreText.innerHTML = scoreTag;
    }
}

function startTimer(time){
    counter = setInterval(timer, 1000);
    function timer(){
        timeCount.textContent = time; //changing the value of timeCount with time value
        
        
        // -----------------------
        var timer_mm_ss = time.split(':');
        //by parsing integer, I avoid all extra string processing
        var minutes = parseInt(timer_mm_ss[0], 10);
        var seconds = parseInt(timer_mm_ss[1], 10);
        --seconds; //decrement the time value
        minutes = (seconds < 0) ? --minutes : minutes;
        if (minutes < 0) clearInterval(interval);
        seconds = (seconds < 0) ? 59 : seconds;
        seconds = (seconds < 10) ? '0' + seconds : seconds;
        //minutes = (minutes < 10) ?  minutes : minutes;
        $('.countdown').html(minutes + ':' + seconds);
        time = minutes + ':' + seconds;
        // -----------------------
        if(time == "0:00"){ //if timer is less than 0
            clearInterval(counter); //clear counter
            clearInterval(counterLine); //clear counterLine
            showResult(); //calling showResult function
            timeText.textContent = "Time Off"; //change the time text to time off
            const allOptions = option_list.children.length; //getting all option items
            let correcAns = questions[que_count][questions[que_count].answer_correct]; //getting correct answer from array
            for(i=0; i < allOptions; i++){
                if(option_list.children[i].textContent == correcAns){ //if there is an option which is matched to an array answer
                    option_list.children[i].setAttribute("class", "option correct"); //adding green color to matched option
                    // option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag); //adding tick icon to matched option
                    console.log("Time Off: Auto selected correct answer.");
                }
            }
            for(i=0; i < allOptions; i++){
                option_list.children[i].classList.add("disabled"); //once user select an option then disabled all options
            }
            // next_btn.classList.add("show"); //show the next button if user selected any option
        }
    }
}

function startTimerLine(time){
    counterLine = setInterval(timer, 29);
    function timer(){
        time += 1; //upgrading time value with 1
        time_line.style.width = time + "px"; //increasing width of time_line with px by time value
        if(time > 549){ //if time value is greater than 549
            clearInterval(counterLine); //clear counterLine
        }
    }
}

function queCounter(index){
    //creating a new span tag and passing the question number and total question
    let totalQueCounTag = '<span><p>'+ index +'</p> of <p>'+ questions.length +'</p> Questions</span>';
    bottom_ques_counter.innerHTML = totalQueCounTag;  //adding new span tag inside bottom_ques_counter
}

function loadExam(){
    $.ajax({
        type: 'GET',
        url: '/loadExam',
        success:function(data){
            if (data) {            
                exams = data;
                var options = ''; //create your "title" option
                $(exams).each(function(index, exam){ //loop through your elements
                    options += '<option value="'+exam.id+'">'+exam.name+'</option>'; //add the option element as a string
                });
    
                $(select_Exam).append(options);
            }
            else{
                start_btn.classList.add("disabled");
            }
            
            $(select_Exam).select2({
                placeholder: 'Chọn đề kiểm tra'
              });
        }
    });
}