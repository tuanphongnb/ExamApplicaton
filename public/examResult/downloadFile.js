var form = document.querySelector(".container-download form");
const select_Exam = document.querySelector(".container-download .exam .exam_name");

form.addEventListener("submit", submitForm);

function submitForm(e) {
    var exam_name = $(select_Exam).find(":selected").text();
    e.preventDefault();
    $.ajax({
        url: '/download_exam_result',
        // dataType: "jsonp",
        data: {
            'examName': exam_name
        },
        type: 'GET',
        jsonpCallback: 'callback', // this is not relevant to the POST anymore
        success: function (res) {
            window.location = '/download_exam_result?examName='+ exam_name;
        },
        error: function (xhr, status, error) {
            var messageError ;
            if (error == "Not Found") {
                messageError = 'Chưa có kết quả cho bài kiểm tra "<b>'+ exam_name +'</b>"'
            }else{
                messageError= error;
            }
            $.toast({ 
                text : messageError, 
                bgColor : 'red',              // Background color for toast
                textColor : '#eee',            // text color
                allowToastClose : true,       // Show the close button or not
                hideAfter : 5000,              // `false` to make it sticky or time in miliseconds to hide after
                textAlign : 'left',            // Alignment of text i.e. left, right, center
                position : 'bottom-right'       // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values to position the toast on page
              });
            console.error('Error: ' + error);
            $('#lblResponse').html('Error connecting to the server.');
        },
    });
    
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
                    options += '<option value="'+exam.name+'">'+exam.name+'</option>'; //add the option element as a string
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