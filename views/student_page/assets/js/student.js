// student setting page script
// function Change Password
Change_Password = (new_password) => {
    console.log("New Password : " + new_password);
    $.ajax({
        url: '/student/change_password',
        type: 'patch',
        dataType: 'json',
        data: {
            newPassword: newPassword
        },
        success: (msg_complete) => {
            console.log(msg_complete.responseText);

        },
        error: (msg_error) => {
            console.log(msg_error);
        }
    })
}

// home page script
show_text = (id) => {
    // console.log(id);
    // console.log(id.id);
    var bool = $('#' + id).is(":hidden")
    // console.log(bool);
    $('#' + id).toggleClass('hidden')
    $('#' + id).attr('hidden', !bool)
    if (bool == true) {
        $('#' + id + '_toggle_btn').text('ซ่อน').removeClass('btn-primary').addClass('btn-secondary')
    } else {
        $('#' + id + '_toggle_btn').text('แสดง').removeClass('btn-secondary').addClass('btn-primary')
    }

}

// edit profile page script

edit_profile = (new_weight, new_height, new_password, new_retype_password) => {
    console.log('New data : ', new_weight, new_height, new_password, new_retype_password);
    $.ajax({
        type: 'PATCH',
        url: '/student/update_profile',
        dataType: 'json',
        data: {
            new_weight,
            new_height,
            new_password,
            new_retype_password
        },
        success: (msg_back) => {
            console.log(msg_back);
            $.alert({
                title: 'เสร็จสิ้น!',
                content: msg_back.success,
                type: 'green',
                buttons: {
                    ok: {
                        text: "ยืนยัน",
                        btnClass: 'btn-primary',
                        keys: ['enter'],
                        action: function () {
                            
                            setTimeout(() => {
                                window.location.reload();
                            }, 100)
                        }
                    }}
            });
            // $('#edit_modal').modal('toggle');
            // setTimeout(() => {
            //     window.location.reload();
            // }, 100)

        },
        error: (msg_back) => {
            console.log(msg_back);
        }
    })
}


// history page script
// ------------ new script ------------ //

// get date today
var global_date = '';
getDate = () => {
    var today = new Date();
    console.log(today);
    global_date = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2);
    $("#selected_month").val(global_date);
}

// avarage data
average_data = (data) => {
    var sum = 0;
    var nums = 0;
    data.forEach(number => {
        if (number != 0) {
            sum += number;
            nums++;
        }
    });
    var avg = sum / nums;
    return avg;
}

// sum income all value
sum_data = (data) => {
    var sum = 0;
    processed_data.forEach(number => {
        if (number != 0) {
            sum += number;
        }
    });
    return sum;
}

// process data
process_data = (data, mode) => {
    // console.log('data : '+data+ ' mode : '+mode );
    var data_unprocess = data.data_to_client;
    // console.log(data_unprocess);
    var init_data = 0;
    var data_process = [];
    for (let j = 1; j < 32; j++) {
        for (let i = 0; i < data_unprocess.length; i++) {
            // console.log('Data : ',data_unprocess[i]);
            var date = new Date(data_unprocess[i].date);
            // console.log('date : ',date);
            // console.log('Date : '+j);
            // console.log('date format : ',date.getDate());
            if (date.getDate() == j) {
                if (mode == 'mode_calories') {
                    init_data = Number(data_unprocess[i].calories) + Number(init_data);
                }
                if (mode == 'mode_income') {
                    init_data = Number(data_unprocess[i].deposit) + Number(init_data);
                }
                if (mode == 'mode_expend') {
                    init_data = Number(data_unprocess[i].withdraw) + Number(init_data);
                }
                // console.log('Data : ',init_data);    
            }
        }
        data_process.push(init_data)
        init_data = 0;
    }
    return data_process;
}

// start page chart and summary
get_data_start_page = () => {
    $.get('/student/get_data_graph/?month=' + global_date + '&mode=mode_calories', (data) => {
        // draw_calories_chart(data);   
        // test
        draw_chart(process_data(data, "mode_calories"), "mode_calories");

        processed_data = process_data(data, "mode_calories")
        calories_avg = average_data(processed_data)
        console.log('calories avg : ',calories_avg);
        if (isNaN(calories_avg))  {
           $('#calories_avg').text('0 แคล'); 
        }
        else {
            $('#calories_avg').text(calories_avg + ' แคล test');
        } 
       
        
    })
    $.get('/student/get_data_graph/?month=' + global_date + '&mode=mode_income', (data) => {
        processed_data = process_data(data, "mode_income")
        // var income_avg = average_data(processed_data);
        sum_income = sum_data(processed_data)
        $('#income_avg').text(sum_income + ' บาท');
    })
    $.get('/student/get_data_graph/?month=' + global_date + '&mode=mode_expend', (data) => {
        processed_data = process_data(data, "mode_expend")
        var expend_avg = average_data(processed_data);
        if (isNaN(expend_avg))  {
           $('#expend_avg').text('0 บาท'); 
        }
        else {
            $('#expend_avg').text(expend_avg + ' บาท');
        } 
        
    })
}


// select month and mode
$('#selected_month, #radio_select input').on('change', () => {
    var radio_val = $("input[name='mode']:checked", '#radio_select').val();
    var select_month = $('#selected_month').val();
    // console.log('month : ' + select_month + ' mode : ',radio_val);
    $.ajax({
        type: 'GET',
        url: '/student/get_data_graph/?month=' + select_month + '&mode=' + radio_val,
        success: (msg_back) => {
            // console.log(msg_back);
            if (radio_val == 'mode_calories') {
                // test new chart
                draw_chart(process_data(msg_back, radio_val), radio_val);
                // calories
                change_month_set_summary_calories(select_month);
                // income
                change_month_set_summary_income(select_month);
                // expend
                change_month_set_summary_expend(select_month);
            }
            if (radio_val == 'mode_income') {
                // test new chart
                draw_chart(process_data(msg_back, radio_val), radio_val);
                // calories
                change_month_set_summary_calories(select_month);
                // income
                change_month_set_summary_income(select_month);
                // expend
                change_month_set_summary_expend(select_month);
            }
            if (radio_val == 'mode_expend') {
                // test new chart
                draw_chart(process_data(msg_back, radio_val), radio_val);
                // calories
                change_month_set_summary_calories(select_month);
                // income
                change_month_set_summary_income(select_month);
                // expend
                change_month_set_summary_expend(select_month);
            }

        },
        error: (msg_back) => {
            console.log(msg_back);
        }
    })
})

change_month_set_summary_calories = (select_month) => {
    $.get('/student/get_data_graph/?month=' + select_month + '&mode=mode_calories', (data) => {
        processed_data = process_data(data, "mode_calories")
        // var income_avg = average_data(processed_data);
        // processed_data = process_data(msg_back,"expend")
        var calories_avg = average_data(processed_data);
        $('#calories_avg').text(calories_avg + ' แคล');
    })
}

change_month_set_summary_income = (select_month) => {
    $.get('/student/get_data_graph/?month=' + select_month + '&mode=mode_income', (data) => {
        processed_data = process_data(data, "mode_income")
        // var income_avg = average_data(processed_data);
        var sum = 0;
        processed_data.forEach(number => {
            if (number != 0) {
                sum += number;
            }
        });
        $('#income_avg').text(sum + ' บาท');
    })
}

change_month_set_summary_expend = (select_month) => {
    $.get('/student/get_data_graph/?month=' + select_month + '&mode=mode_expend', (data) => {
        processed_data = process_data(data, "mode_expend")
        // var income_avg = average_data(processed_data);
        // processed_data = process_data(msg_back,"expend")
        var expend_avg = average_data(processed_data);
        $('#expend_avg').text(expend_avg + ' บาท');
    })
}

// draw chart  
draw_chart = (chart_data, mode) => {
    // draw chart
    // console.log('data : ',chart_data);

    if (mode == 'mode_calories') {
        var label_text = "แคลอรี่";
        var color_line = "#3e95cd";
    }
    if (mode == 'mode_income') {
        var label_text = "รายรับ";
        var color_line = "#54FC70";
    }
    if (mode == 'mode_expend') {
        var label_text = "รายจ่าย";
        var color_line = "#FF7373";
    }
    var canvas = $('#canvas_container').html('<canvas id="data_chart"></canvas>');
    var ctx = $('#data_chart');
    var chart_data_month = {
        type: 'line',
        data: {
            labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
                26, 27, 28, 29, 30, 31
            ],
            datasets: [{
                data: chart_data,
                label: label_text,
                borderColor: color_line,
                fill: false
            }]
        },
        options: {
            responsive: true
        }

    };

    var draw_chart = new Chart(ctx, chart_data_month);

}


// ------------ new script ------------ //