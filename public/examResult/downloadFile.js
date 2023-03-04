var form = document.querySelector(".container-download form");
const select_Exam = document.querySelector(".container-download .exam .exam_name");

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