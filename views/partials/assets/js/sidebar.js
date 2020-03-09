
 $(document).ready(() => {
    sidebar_get_name();
 })

sidebar_get_name = () => {
    $.ajax({
        url:'/get_name',
        type:'GET',
        dataType:'json',
        success:(msg_back) => {
        //    console.log(msg_back);
           
            $("#insert_sidebar_name").text(msg_back.pre_name+' '+msg_back.first_name+' '+msg_back.last_name)
        }
    })
}
