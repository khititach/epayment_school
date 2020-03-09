// store home page script
// search student
$('#formSearchStudentID').on('submit', (e) => {
    e.preventDefault();
    var idcard = $('#idcardORstuID').val();
    console.log("ID card : " + idcard);
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
                console.log("error : " + msg_back.responseText);
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
        '<h5>' + data.pre_name + " " + data.first_name + " " + data.last_name + '</h5>' +
        '<h5>' + data.sex + ' </h5>' +
        '<h5>' + data.tel + '</h5>' +
        '<h5>' + data.class + ' / ' + data.room + '</h5>' +
        '<h5 id="student_current_money" data-value="' + data.current_money + '">' + data.current_money + ' บาท </h5>';
    $("#showStudentData").html(student_data_table)
    reqUserBuyItemData = data.student_id;
    student_currentMoney = data.current_money;
    $("#item_price").select().attr('readonly', false);
    $("#buyItem_confirm").attr("disabled", false);
}

// - - - - - buy item by insert price - - - - - 
// // init buy item
initBuyitem = (item_price) => {
    console.log("Student ID : " + reqUserBuyItemData);
    console.log("Item Price : " + item_price);
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
    console.log('student id : ' + student_id + ' > buy : ' + item_price);
    $.ajax({
        type: 'PATCH',
        url: '/store/buy_item',
        dataType: 'json',
        data: {
            student_id,
            item_price
        },
        success: (msg_back) => {
            console.log(msg_back);
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
            console.log(msg_back);
            alert_popup(msg_back.responseJSON);

        }
    })
}

// - - - - - buy item by insert price - - - - - 


confirm_buy_item = (student_id, food_id, food_name, food_price) => {
    var student_money = $('#student_current_money').data('value');
      console.log('student current money : ',student_money,' / food price : ',food_price);
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
                        console.log('ยกเลิกการเลือกรายการอาหาร');
                    }
  
                }
            },
        });
      }
  
  }

seleted_buy_item_list = (student_id, food_id, food_name, food_price) => {
    console.log('student id : ', student_id, ' buy : ', food_id);
    $.ajax({
        type: 'PATCH',
        url: '/store/buy_item_list',
        dataType: 'json',
        data: {
            student_id,
            food_id
        },
        success: (msg_back) => {
            console.log(msg_back);
            alert_js_success(msg_back.success);
            // clear_data();
        },
        error: (msg_back) => {
            console.log(msg_back);
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


// = = = = = Add and Remove food = = = = = 
category_check_btn = () => {
    $.get("/store/category/get_list", (data) => {
        // console.log('store food list : ',data);
        for (let i = 0; i < data.store_food_list.length; i++) {
            for (let j = 0; j - 1 < data.food_data.length; j++) {
                // console.log('id : ',$('#ID_'+j).val());
                // console.log('store list :',data.store_food_list[i]);
                if ($('#ID_' + j).val() == data.store_food_list[i]) {
                    $('#ID_' + j).removeClass('btn-success').addClass('btn-secondary').attr('disabled', true);
                }
            }
        }

    });

}

// add food to menu book
add_food_menu_book = (food_id) => {

    console.log(food_id);

    $.ajax({
        type: "PATCH",
        url: '/store/category/add_menu',
        dataType: 'json',
        data: {
            food_id
        },
        success: (msg_back) => {
            console.log(msg_back);
            // alert_popup_success(msg_back);
            alert_popup(msg_back);
            // add_food_tr(msg_back);
        },
        error: (msg_back) => {
            console.log(msg_back);
            alert_popup(msg_back.responseJSON);
        }
    })
}

// delete food from menu book
delete_food_menu_book = (food_id) => {
    console.log('food id to delete : ', food_id);
    $.ajax({
        type: 'PATCH',
        url: '/store/category/delete_menu',
        dataType: 'json',
        data: {
            food_id
        },
        success: (msg_back) => {
            console.log(msg_back);
            alert_popup(msg_back);
        },
        error: (msg_back) => {
            console.log(msg_back);
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