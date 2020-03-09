$(document).ready(() => {
    $.ajax({
        url:'/get_school_name',
        type:'GET',
        dataType:'json',
        success:(msg_back) => {
            // console.log(msg_back);
            // console.log("Success : " + msg_back);
            // send data to function
            add_school_name(msg_back);
        },error:(msg_back) => {
            // console.log(msg_back);
            // console.log("Error : " + msg_back);
        }
    })
})

add_school_name = (school_data) => {
    var school_name = '<h1 class="display-4" style="color:#f8b739">'+ school_data.school_name_th +'</h1>';
    var school_name_eng = school_data.school_name_eng;
    $("#insert_school_name").html(school_name)
    $("#title-tag").text(school_name_eng)
}