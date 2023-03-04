var form = document.getElementById("form");
form.addEventListener("submit", submitForm);

function onSelectFileHandler(e){
    $('input[type=file]').val('');
}
function submitForm(e) {
    e.preventDefault();
    var exam_name = document.getElementById("exam_name");
    var exam_time = document.getElementById("exam_time");
    var file = document.getElementById("file");
    var formData = new FormData();
    formData.append("exam_name", exam_name.value);
    formData.append("exam_time", exam_time.value);
    formData.append("file", file.files[0]);
    const reader = new FileReader();
    reader.readAsDataURL(file.files[0]);
    reader.onload = function (evt) {
        $.ajax({
            url: '/upload_exam',
            dataType: "json",
            data: formData,
            type: 'POST',
            processData: false,
            contentType: false,
            jsonpCallback: 'callback', // this is not relevant to the POST anymore
            success: function (res) {
                // var res = jQuery.parseJSON(data);
                // $('#lblResponse').html(res.msg);
                $.toast({ 
                    text : "Thành công", 
                    bgColor : 'green',              // Background color for toast
                    textColor : '#eee',            // text color
                    allowToastClose : true,       // Show the close button or not
                    hideAfter : 5000,              // `false` to make it sticky or time in miliseconds to hide after
                    textAlign : 'left',            // Alignment of text i.e. left, right, center
                    position : 'bottom-right'       // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values to position the toast on page
                  });
                console.log('Success: ');
            },
            error: function (xhr, status, error) {
                console.log('Error: ' + error.message);
                $('#lblResponse').html('Error connecting to the server.');
            },
            // complete: function (data) {
            //     $('#form')[0].reset(); // this will reset the form fields
            // }
        });
        // console.log(evt.target.result);
    }

    reader.onerror = function (err) {
        $.toast({ 
            text : "File đã bị thay đổi, vui lòng chọn lại tệp.", 
            bgColor : 'red',              // Background color for toast
            textColor : '#eee',            // text color
            allowToastClose : true,       // Show the close button or not
            hideAfter : 5000,              // `false` to make it sticky or time in miliseconds to hide after
            textAlign : 'left',            // Alignment of text i.e. left, right, center
            position : 'bottom-right'       // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values to position the toast on page
          });
        // read error caught here
        // console.log(err);
        // console.log(err.target.error);
    }

    // for(let i =0; i < files.files.length; i++) {
    //         formData.append("file", files.files[i]);
    // }
    // fetch("http://localhost:8080/upload_files", {
    //     method: 'POST',
    //     body: formData,
    //     // headers: {
    //     //   "Content-Type": "multipart/form-data",
    //     //   "boundary": "MyBoundary"
    //     // }
    // })
    //     .then((res) => console.log(res))
    //     .catch((err) => ("Error occured", err));
 
    e.preventDefault();
}