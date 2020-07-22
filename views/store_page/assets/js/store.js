// store home page script
// search student
$('#formSearchStudentID').on('submit', (e) => {
    e.preventDefault();
    var idcard = $('#idcardORstuID').val();
    // console.log("ID card : " + idcard);
    if (!idcard) {
        alert_js('กรุณาใส่เลขบัตร หรือ รหัสนักเรียน');
        $("#idcardORstuID").select();
    } else {
        $.ajax({
            url: '/store/search_student',
            type: 'POST',
            dataType: 'json',
            data: {
                idcard
            },
            success: (msg_back) => {
                // console.log("success : " + JSON.stringify(msg_back));
                $('#idcardORstuID').attr('readonly', true);
                $("#btn_check").attr("disabled", true);
                $('.buy_btn').attr("disabled", false);
                // create student detail table
                create_table(msg_back.success)
            },
            error: (msg_back) => {
                // console.log("error : " + msg_back.responseText);
                // console.log("error : " + msg_back.responseJSON.error);
                alert_js(msg_back.responseJSON.error);
                clear_data();
            }
        })
    }
})

// Show student data
var reqUserBuyItemData;
var student_currentMoney;
create_table = (data) => {
    // console.log(data);

    var student_data_table = '<h5 id="student_id" value=' + data.student_id + '>' + data.student_id + '</h5>' +
        '<h5>' + data.pre_name + data.first_name + " " + data.last_name + '</h5>' +
        '<h5>' + data.sex + ' </h5>' +
        '<h5>' + data.tel + '</h5>' +
        '<h5>' + data.class + ' / ' + data.room + '</h5>' +
        '<h5 id="student_current_money" data-value="' + data.current_money + '">' + data.current_money + ' บาท </h5>';
    $('#showStudentImageData').attr('src',data.image)
    $("#showStudentData").html(student_data_table)
    reqUserBuyItemData = data.student_id;
    student_currentMoney = data.current_money;
    $("#item_price").select().attr('readonly', false);
    $("#buyItem_confirm").attr("disabled", false);
}

// - - - - - buy item by insert price - - - - - 
// // init buy item
initBuyitem = (item_price) => {
    // console.log("Student ID : " + reqUserBuyItemData);
    // console.log("Item Price : " + item_price);
    if (Number(item_price)  <= 0) {
        // alert('กรูณาใส่จำนวนเงินมากกว่า 0');
        // alert_popup({error:'กรูณาใส่จำนวนเงินมากกว่า 0'});
        $.alert({
            title: 'แจ้งเตือน!',
            content:'กรูณาใส่จำนวนเงินมากกว่า 0',
            type: 'red',
            buttons: {
                ok: {
                    text: "ยืนยัน",
                    btnClass: 'btn-primary',
                    keys: ['enter'],
                    action: function () {
                        setTimeout(() => {
                            $("#item_price").select();
                          }, 300)
                    }
                }}
        });
        // $("#item_price").select()
    }
    if (student_currentMoney < item_price) {
        // alert_popup({error:'จำนวนเงินไม่เพียงพอ'});
        $.alert({
            title: 'แจ้งเตือน!',
            content:'จำนวนเงินไม่เพียงพอ',
            type: 'red',
            buttons: {
                ok: {
                    text: "ยืนยัน",
                    btnClass: 'btn-primary',
                    keys: ['enter'],
                    action: function () {
                        clear_data();
                    }
                }}
        });
        
    } 
    if (student_currentMoney > item_price && Number(item_price) > 0)  {
        buy_item_confirm(reqUserBuyItemData, item_price);
    }
}

// buy item confirm script
buy_item_confirm = (student_id, item_price) => {
    // console.log('student id : ' + student_id + ' > buy : ' + item_price);
    $.ajax({
        type: 'PATCH',
        url: '/store/buy_item',
        dataType: 'json',
        data: {
            student_id,
            item_price
        },
        success: (msg_back) => {
            // console.log(msg_back);
            // alert(msg_back.success);
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
                            clear_data();
                          
                        }
                    }}
            });
            
        },
        error: (msg_back) => {
            // console.log(msg_back);
            alert_popup(msg_back.responseJSON);

        }
    })
}

// - - - - - buy item by insert price - - - - - 


confirm_buy_item = (student_id, food_id, food_name, food_price) => {
    var student_money = $('#student_current_money').data('value');
      // console.log('student current money : ',student_money,' / food price : ',food_price);
      if (food_price > student_money) {
        toastr.error("จำนวนเงินไม่เพียงพอ")
        clear_data();
      } else {
        $.confirm({
            title: 'ยืนยันการซื้อ',
            content: 'ชำระเงิน ' + food_name + ' ราคา ' + food_price,
            type: 'green',
            buttons: {
                ok: {
                    text: "ยืนยัน",
                    btnClass: 'btn-primary',
                    keys: ['enter'],
                    action: function () {
                      seleted_buy_item_list(student_id, food_id, food_name, food_price);          
                    }
                },
                cancel: {
                    text: "ยกเลิก",
                    btnClass: 'btn-secondary',
                    keys: ['esc'],
                    action: function () {
                        // console.log('ยกเลิกการเลือกรายการอาหาร');
                    }
  
                }
            },
        });
      }
  
  }

seleted_buy_item_list = (student_id, food_id, food_name, food_price) => {
    // console.log('student id : ', student_id, ' buy : ', food_id);
    $.ajax({
        type: 'PATCH',
        url: '/store/buy_item_list',
        dataType: 'json',
        data: {
            student_id,
            food_id
        },
        success: (msg_back) => {
            // console.log(msg_back);
            alert_js_success(msg_back.success);
            // clear_data();
        },
        error: (msg_back) => {
            // console.log(msg_back);
        }
    })
}

alert_js_success = (msg) => {
    $.confirm({
        title: 'แจ้งเตือน',
        content: msg,
        type: 'green',
        autoClose: 'ok|3000',
        keyboardEnabled: true,
        buttons: {
            ok: {
                text: "ยืนยัน",
                btnClass: 'btn-primary',
                keys: ['enter'],
                action: function () {
                    clear_data();
                }
            }
        }
    });
}

alert_js = (msg) => {
    $.confirm({
        title: 'แจ้งเตือน',
        content: msg,
        type: 'red',
        autoClose: 'cancel|3000',
        keyboardEnabled: true,
        buttons: {
            cancel: function () {
                // alert('canceled');
            }
        }

    });
}


// * * * * * buy item by select from food list * * * * * 

// * * * * * buy item by select from food list * * * * * 


// // = = = = = Add and Remove food = = = = = 
category_check_btn = () => {
    $.get("/store/category/get_list", (data) => {
        var store_list = data.store_food_list;
        // console.log('store food list : ',data);
        $('.category-btn').each((index,data) => {
            for (let i = 0; i < store_list.length; i++) {
            //    console.log('category btn : ',data.value);
            //    console.log('store food btn : ',store_list[i]);
            //    console.log('category btn : ',data);
               if (data.value == store_list[i]) {
                //    console.log('data value = store food id list');
                   
                   $('#'+data.id).removeClass('btn-success').addClass('btn-secondary').attr('disabled', true);
               }
            }    
        })

    });

}

// add food to menu book
add_food_menu_book = (food_id) => {

    // console.log(food_id);

    $.ajax({
        type: "PATCH",
        url: '/store/category/add_menu',
        dataType: 'json',
        data: {
            food_id
        },
        success: (msg_back) => {
            // console.log(msg_back);
            // alert_popup_success(msg_back);
            alert_popup(msg_back);
            // add_food_tr(msg_back);
        },
        error: (msg_back) => {
            // console.log(msg_back);
            alert_popup(msg_back.responseJSON);
        }
    })
}

// delete food from menu book
delete_food_menu_book = (food_id) => {
    // console.log('food id to delete : ', food_id);
    $.ajax({
        type: 'PATCH',
        url: '/store/category/delete_menu',
        dataType: 'json',
        data: {
            food_id
        },
        success: (msg_back) => {
            // console.log(msg_back);
            alert_popup(msg_back);
        },
        error: (msg_back) => {
            // console.log(msg_back);
            alert_popup(msg_back.responseJSON);
        }
    })
}

// = = = = = Add and Remove food = = = = = 


clear_data = () => {
    $('.buy_btn').attr("disabled", true);
    $("#idcardORstuID").select().attr('readonly', false).val('');
    $("#btn_check").attr("disabled", false);
    $("#item_price").attr('readonly', true).val('');
    $("#buyItem_confirm").attr("disabled", true);
    $('#showStudentImageData').attr('src','/partials/image/unprofile.jpg')
    $("#showStudentData").html("");
}

alert_popup = (msg) => {
    if (msg.success != null) {
        // alert(msg.success);
        $.alert({
            title: 'เสร็จสิ้น!',
            content: msg.success,
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
    }
    if (msg.error != null) {
        // alert(msg.error);
        $.alert({
            title: 'แจ้งเตือน!',
            content: msg.error,
            type: 'red',
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
    }
    // setTimeout(() => {
    //     window.location.reload();
    // }, 100)
}


// store report page script


// get data by select month and mode
$('#selected_month').on('change',() => {
    // var radio_val = $("input[name='mode']:checked", '#radio_select').val();
    var select_month = $('#selected_month').val();
    // console.log('month : ' + select_month);
    $.ajax({
        type:'GET',
        url:'/store/report/get_data_graph/?month='+select_month+'&mode=mode_income',
        success:(msg_back) => {
            // console.log(msg_back);
            draw_income_chart(msg_back);
        }, 
        error:(msg_back) => {
            // console.log(msg_back);
        }
    })
})

// today
var global_date = '';
getDate = () => {
    var today = new Date();
    // console.log(today);
    global_date = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2);
    $("#selected_month").val(global_date);
    $("#selected_month_sales_data").val(global_date);
}

get_data_start_page = () => {
    $.get('/store/report/get_data_graph/?month='+global_date+'&mode=mode_income',(data) => {
        // console.log('data from server : ',data);
        
        draw_income_chart(data);
        processed_data = process_data(data,"income")
        // var income_avg = average_data(processed_data);
        var sum = 0;
        processed_data.forEach(number => {
            if (number != 0) {
                sum += number;
            }
        });
        $('#income_avg').text(sum+' บาท');
    })
}

process_data = (data,mode) => {
    // console.log('data : '+data+ ' mode : '+mode );
    var data_unprocess = data.data_to_client;
    // console.log(data_unprocess);
    var init_data = 0;
    var data_process = [];
    for (let j = 1; j < 32; j++) {
        for (let i = 0; i < data_unprocess.length; i++) {
            // console.log('Data : ',data_unprocess[i]);
            var date = new Date(data_unprocess[i].date) ;
            // console.log('date : ',date);
            // console.log('Date : '+j);
            // console.log('date format : ',date.getDate());
            if (date.getDate() == j) {
                if (mode == 'income') {
                    init_data = Number(data_unprocess[i].income) + Number(init_data);
                }
                // console.log('Data : ',init_data);    
            }       
        }
        data_process.push(init_data)
        init_data = 0;
    }
    return data_process;
}


draw_income_chart = (data) => {
    // init data
    processed_data = process_data(data,"income")
    // console.log('data process :',processed_data);
        // sum topup
    var sum = 0;
    processed_data.forEach(number => {
        if (number != 0) {
            sum += number;
            
        }
    });
    // var income_avg = average_data(processed_data);
    // console.log('data process sum :',sum);
    $('#income_avg').text(sum+' บาท');

    // draw chart
    var canvas = $('#canvas_income_history_container').html('<canvas id="data_chart"></canvas>');
    var ctx = $('#data_chart');
    var chart_data_month = {
        type: 'line',
        data:{
            labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
            26, 27, 28, 29, 30, 31],
            datasets:[
                {
                    // data: [200, 0, 100, 0, 0, 0, 100, 300, 0, 100],
                    data:processed_data,
                    label: "รายรับ",
                    borderColor: "#54FC70",
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                yAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: 'บาท'
                  }
                }],
                xAxes:[{
                    scaleLabel: {
                        display: true,
                        labelString: 'วันที่'
                      }
                }]
            }
        }
        
    };

    var calories_chart = new Chart(ctx,chart_data_month);
}

// get food sales data by select month 
$('#selected_month_sales_data').on('change',() => {
    var select_month = $('#selected_month_sales_data').val();
    // console.log('month : ' + select_month);
    $.get('/store/report/get_food_sales/?month='+select_month,(data) => {
        // console.log('food sales data : ' ,data);
        // process data for draw chart
        
        draw_food_sales_chart(process_food_sales(data));
        insert_food_sales_list(process_food_sales(data))
    })
})

// chart food sales
get_food_sales = () => {

    $.get('/store/report/get_food_sales/?month='+global_date,(data) => {
        // console.log('food sales data : ' ,data);
        // process data for draw chart
        
        draw_food_sales_chart(process_food_sales(data));
        insert_food_sales_list(process_food_sales(data))
    })
}

// process food sales data
process_food_sales =  (data) => {
    // console.log('data : ',data);
    var process_data = [];
    var process_data_detail = {};
    var food_id_list = [];
    // console.log('data : ',data);
    
    if (jQuery.isEmptyObject(data)) {
        var last_data = 0
    } else {
        var last_data = data[data.length-1].food_id;
    }
    

    for (let j = 1; j <= last_data; j++) {
        for (let i = 0; i < data.length; i++) {
            // console.log('i > ',i,' data : ',data[i],' / j > ',j);
            
            // console.log('data food id : ',data[i].food_id,' / j > ',j);
              
                if (data[i].food_id != 0) {
                    if (data[i].food_id == j) {
                        // console.log('food _id = j > ',data[i].food_id,' = ',j);
                        
                        process_data_detail.food_name = data[i].food_name;
                        process_data_detail.food_id = data[i].food_id;
                        
                        if (process_data_detail.count == null) {
                            process_data_detail.count = 1;
                        } else {
                            process_data_detail.count++;
                        }
                    } else {
                        // console.log('food _id != j > ',data[i].food_id,' != ',j);
                    }
                    
                }    
        }
        // console.log('food id list detail in for: ',process_data_detail );
        process_data.push(process_data_detail);
        // console.log('process data array : ',process_data);
        process_data_detail = {}
        
    }
    // console.log('food id list detail in out for: ',process_data_detail );

    // process_data.push($.makeArray( process_data_detail['ชาเย็น'] ))

    // console.log('data detail : ',$.isEmptyObject(process_data_detail)); 
    // console.log('food id list detail : ',$.makeArray( process_data_detail['ชาเย็น'] ) );

    // if ($.isEmptyObject(process_data_detail) != true) { // filter delete empty obj
    //     process_data.push(process_data_detail)
    //     var process_data_detail = {}
    // }

    var process_data = process_data.filter(function (el) {
        return el.food_id != null;
    });

    // console.log('food id list : ',process_data_detail);
    // console.log('process data array delete empty : ',process_data);

    return process_data;
}

// insert food list to div
insert_food_sales_list = (data) => {
    // console.log('data : ',data);
    // init div
    $('#insert_food_sales_list').html('');
    for (let i = 0; i < data.length; i++) {
       
         var insert_to_div = '<div class="row">'+
                            '<div class="col-md-6">'+
                                '<h5>'+ data[i].food_name+'</h5>'+
                            '</div>'+
                            '<div class="col-md-6 font-black">'+
                                '<h6>'+ data[i].count+' จาน/ชาม/ชิ้น/แก้ว</h6>'+
                            '</div>'+
                        '</div>';
        $('#insert_food_sales_list').append(insert_to_div);
    }
   

}


    // draw food sales chart 
        // platform draw chart
        // data : 
        // [ {food_name:'name 1', food_id:'id 1', count:'count '},
        // {food_name:'name 2', food_id:'id 2', count:'count '} ]
draw_food_sales_chart = (processed_data) => {
    // labels 
    var labels_data = [];
    jQuery.each(processed_data,(key,data) => {
        // console.log('data : ',data);
        labels_data.push(data.food_name)
    })

    // count 
    var count_data = [];
    jQuery.each(processed_data,(key,data) => {
        // console.log('data : ',data);
        count_data.push(data.count)
    })
 
    
    // console.log('labels : ',labels_data);
    // console.log('count data : ',count_data);
    var canvas = $('#canvas_container').html('<canvas id="data_sales_chart"></canvas>');
    var ctx = $('#data_sales_chart');
    var sales_chart = {
        type: 'bar',
        data: {
            labels: labels_data,
            datasets: [{
                label:'ยอดขาย(จาน/ชาม/ชิ้น)',
                minBarLength: 0,
                data: count_data,
                backgroundColor: '#4287f5', 
                
            }]
        },
        options:{
            scales:{
                yAxes:[{
                    display:true,
                    scaleLabel: {
                        display: true,
                        labelString: 'จำนวนที่ขาย'
                    },
                    ticks:{
                        min:0,
                        beginAtZero: true,
                        userCallback: function(label, index, labels) {
                            // when the floored value is the same as the value we have a whole number
                            if (Math.floor(label) === label) {
                                return label;
                            }

                        }
                    }
                }],
                xAxes:[{
                    scaleLabel: {
                        display: true,
                        labelString: 'รายการอาหาร'
                      }
                }]
            }
        }
    
    };

    var draw_sales_chart = new Chart(ctx,sales_chart);
}


// gotoHTMLtoPDF = () => {
//     window.location = '/store/report/download_report'
// }

// change password page 


change_password = (new_password , retype_new_password) => {
    console.log('new password : ', new_password , ' / retype : ',retype_new_password);
    if (new_password != retype_new_password) {
        $.alert({
                title: 'แจ้งเตือน!',
                content: 'ยืนยันรหัสผ่านไม่ตรงกัน',
                type: 'red',
                buttons: {
                    ok: {
                        text: "ปิด",
                        btnClass: 'btn-secondary',
                        keys: ['enter'],
                        action: function () {
                
                        }
                    }}
            });
    } else {
        $.ajax({
            type:'PATCH',
            url:'/store/edit/change_password',
            dataType:'json',
            data:{
                new_password,
                retype_new_password
            },
            success:(msg_back) => {
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
            },
            error:(msg_back) => {
                console.log('change password something wrong > ',msg_back);
                
            }
        })
    }
}

$('#new_retype_password').on('change',() => {
    if ($('#new_retype_password').val() == $('#new_password').val()) {
        $('#new_retype_password').removeClass('input-group-text-edit , input-alert-error').addClass('input-alert-success')
    } else {
        $('#new_retype_password').removeClass('input-group-text-edit , input-alert-success').addClass('input-alert-error')
    }
})