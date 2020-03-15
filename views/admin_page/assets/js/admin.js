// admin home page script
$('#formSearchStudentID').on('submit', (e) => {
    e.preventDefault();
    var idcard = $('#idcardORstuID').val();
    // console.log("ID card : " + idcard);
    if (!idcard) {
        alert('กรุณาใส่เลขบัตร หรือ รหัสนักเรียน');
        $("#idcardORstuID").select();
    } else {
        $.ajax({
            url: '/admin/search_student',
            type: 'POST',
            dataType: 'json',
            data: {
                idcard
            },
            success: (msg_back) => {
                // console.log("success : " + JSON.stringify(msg_back));
                $('#idcardORstuID').attr('readonly', true);
                $("#btn_check").attr("disabled", true);
                // create student detail table
                create_table(msg_back.success)
            },
            error: (msg_back) => {
                // console.log("error : " + msg_back.responseText);
                // console.log("error : " + msg_back.responseJSON.error);
                // alert(msg_back.responseJSON.error);
                
                $.alert({
                    title: 'แจ้งเตือน!',
                    content: msg_back.responseJSON.error,
                    type: 'red',
                    buttons: {
                        ok: {
                            text: "ยืนยัน",
                            // btnClass: 'btn-primary',
                            keys: ['enter'],
                            action: function () {
                            
                            }
                        }}
                });
                clear_data();
            }
        })
    }
})

// Show student data
var reqUserTopupData;
create_table = (data) => {
    // console.log(data);

    var student_data_table = '<h5 for="studentID" id="studentID" value=' + data.student_id + '>' + data.student_id + '</h5>' +
        '<h5 for="firstName">' + data.pre_name + " " + data.first_name + " " + data.last_name + '</h5>' +
        '<h5 for="sex">' + data.sex + ' </h5>' +
        '<h5 for="tel">' + data.tel + '</h5>' +
        '<h5 for="classRoom">' + data.class + ' / ' + data.room + '</h5>' +
        '<h5 for="currentMoney">' + data.current_money + ' บาท </h5>';
    $("#showStudentData").html(student_data_table)
    reqUserTopupData = data.student_id;
    $("#TopupAmount").select().attr('readonly', false).addClass('background-white ');
    $("#topup_confirm").attr("disabled", false);
}

// Top-up

$('#formConfirmTopup').on('submit', (e) => {
    e.preventDefault();
      // console.log("Student ID : " + reqUserTopupData);
    // console.log("Top up : " + reqTopup);
    var reqTopup = $('#TopupAmount').val();
    if (reqTopup <= 0) {
        // alert('กรูณาใส่จำนวนเงินมากกว่า 0');
        $.alert({
            title: 'แจ้งเตือน!',
            content: 'กรูณาใส่จำนวนเงินมากกว่า 0',
            type: 'red',
            buttons: {
                ok: {
                    text: "ยืนยัน",
                    btnClass: 'btn-primary',
                    keys: ['enter'],
                    action: function () {
                        setTimeout(() => {
                            $("#TopupAmount").select()
                        }, 300)
                    
                    }
                }}
        });
       
    } else {
        topup(reqUserTopupData, reqTopup);
    }
})


topup = (studentID, amount) => {
    // console.log("Student ID : " + studentID + " / Top-up : " + amount);
    $.ajax({
        url: '/admin/topup',
        type: 'PATCH',
        dataType: 'json',
        data: {
            student_ID: studentID,
            amount_Topup: amount
        },
        success: (msg_back) => {
            // console.log(msg_back);
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
                                clear_data();
                            }, 300)
                        }
                    }}
            });
            // clear_data();
        },
        error: (msg_back) => {
            // console.log(msg_back);
            // alert(msg_back);
            alert_popup(msg_back.responseJSON);
            // $.alert({
            //     title: 'แจ้งเตือน!',
            //     content: msg_back.error,
            //     type: 'red',
            //     buttons: {
            //         ok: {
            //             text: "ยืนยัน",
            //             btnClass: 'btn-primary',
            //             keys: ['enter'],
            //             action: function () {
            //                 clear_data();
            //             }
            //         }}
            // });
            clear_data();
        }
    })
}

clear_data = () => {
    $("#idcardORstuID").select().attr('readonly', false).val('');
    $("#btn_check").attr("disabled", false);
    $("#TopupAmount").removeClass('background-white').attr('readonly', true).val('');
    $("#topup_confirm").attr("disabled", true);
    $("#showStudentData").html("");
    
}

// - * - * - * - register store page script - * - * - * - 
$('#form_Register_Store').on('submit', (e) => {
    e.preventDefault();
    var formData = $('#form_Register_Store').serialize();
    $.ajax({
        type:'POST',
        url:'/admin/register_store',
        dataType:'json',
        data:formData,
        success:(msg_back) => {
            $.alert({
                title: 'ยืนยัน!',
                content: msg_back.success,
                type:'green',
                buttons: {
                    ok: {
                        text: "ยืนยัน",
                        btnClass: 'btn-primary',
                        keys: ['enter'],
                        action: function () {
                            window.location = '/admin';
                        }
                    }
                }
            })
        },
        error:(msg_back) => {

        }
        
    })
        
})

check_field = (data, name_field, id) => {
    // console.log("Send to check : " + name_field + ' > ' + data);
    // console.log('id : ', '#' + id);
    if (data == '') {
        // console.log('data == null');

        $('#' + id).removeClass('input-alert-success , input-alert-error');
        $('#addAlert' + id + '').html('')
    }
    if (data != '') {
        // console.log('data != null');
        $.ajax({
            type: 'PATCH',
            url: '/admin/register_auto_check/',
            data: {
                name_field,
                data
            },
            success: (msg_back) => {
                // console.log(msg_back);

                add_success_alert(msg_back, id);

            },
            error: (msg_back) => {
                // console.log(msg_back);
                // console.log(msg_back.responseJSON.error);
                add_error_alert(msg_back, id);
            }
        })
    }

}


check_store_name_field = (data, name_field, id) => {
    // console.log("Send to check : " + name_field + ' > ' + data);
    if (data == '') {
        // console.log('data == null');

        $('#' + id).removeClass('input-alert-success , input-alert-error');
        $('#addAlert' + id + '').html('')
    }
    if (data != '') {
        $.ajax({
            type: 'PATCH',
            url: '/admin/register_auto_check_store_name/',
            data: {
                name_field,
                data
            },
            success: (msg_back) => {
                // console.log(msg_back);
                add_success_alert(msg_back, id);

            },
            error: (msg_back) => {
                // console.log(msg_back);
                // console.log(msg_back.responseJSON.error);
                add_error_alert(msg_back, id);
            }
        })
    }
}

add_success_alert = (msg, id) => {
    $('#' + id + '').removeClass('input-group-text , input-alert-error').addClass('input-alert-success')
    $('#addAlert' + id + '').html('<h5e class="alert-success-font">' + msg.success + '</h5e>')
}

add_error_alert = (msg, id) => {
    $('#' + id + '').removeClass('input-group-text , input-alert-success').addClass('input-alert-error')
    $('#addAlert' + id + '').html('<h5e class="alert-error-font">' + msg.responseJSON.error + '</h5e>')
}

// edit store detail script

change_password = (new_password, store_uid) => {
    // console.log('UID : ' + store_uid + ' / new password : ' + new_password);

    $.ajax({
        type: 'PATCH',
        url: '/admin/store_change_password',
        dataType: 'json',
        data: {
            new_password,
            store_uid
        },
        success: (msg_back) => {
            // console.log(msg_back);
            alert_popup(msg_back);
            $('#changePassSubmenu').removeClass('show');
            $('#NewPassword').val('');
        },
        error: (msg_back) => {
            // console.log(msg_back);
            alert_popup(msg_back.responseJSON);
            $('#changePassSubmenu').removeClass('show');
            $('#NewPassword').val('');
        }
    })
}

// edit student script

// delete store script
var init_uid;
init_delete_user = (uid) => {
    // console.log('init delete user : ' + uid);
    init_uid = uid;
}

delete_user = (admin_password) => {
    // console.log('Store uid : ' + init_uid + ' / admin password : ' + admin_password);
    $.ajax({
        type: 'DELETE',
        url: '/admin/delete_store',
        dataType: 'json',
        data: {
            admin_password,
            uid: init_uid
        },
        success: (msg_back) => {
            // console.log(msg_back);
            // refresh_page(msg_back.success)
            alert_popup(msg_back);
            // $.alert({
            //     title: 'เสร็จสิ้น!',
            //     content: msg_back.success,
            //     type: 'green',
            //     buttons: {
            //         ok: {
            //             text: "ยืนยัน",
            //             btnClass: 'btn-primary',
            //             keys: ['enter'],
            //             action: function () {
            //                 setTimeout(() => {
            //                     window.location.reload();
            //                 }, 100) 
                
            //             }
            //         }}
            // });
        },
        error: (msg_back) => {
            // console.log(msg_back.responseJSON.error);
            // alert(msg_back.responseJSON.error);
            // refresh_page(msg_back.responseJSON.error)
            alert_popup(msg_back.responseJSON);
            // $.alert({
            //     title: 'แจ้งเตือน!',
            //     content: msg_back.responseJSON.error,
            //     type: 'red',
            //     buttons: {
            //         ok: {
            //             text: "ยืนยัน",
            //             btnClass: 'btn-primary',
            //             keys: ['enter'],
            //             action: function () {
            //                 setTimeout(() => {
            //                     window.location.reload();
            //                 }, 100) 
                
            //             }
            //         }}
            // });
        }
    })
}

refresh_page = (msg) => {
    alert(msg)
    setTimeout(() => {
        window.location.reload();
    }, 100)
}

// category page script
var old_image = '';
modal_edit_food_data = (food_id, food_name, food_calories, food_quantity, food_price, food_image) => {
    // console.log('Food data : ',food_id, food_name, food_calories, food_quantity, food_price, food_image);

    // set data
    $('#Modal_input_food_id').val(food_id);
    $('#Modal_input_food_name').val(food_name);
    $('#Modal_input_food_calories').val(food_calories);
    $('#Modal_input_food_quantity').val(food_quantity);
    $('#Modal_input_food_price').val(food_price);
    if (food_image != '') {
        
        $('#food_image_change_id').attr('src', food_image)
        old_image = food_image;
    } else {
        $('#food_image_change_id').attr('src', 'https://mdbootstrap.com/img/Photos/Others/placeholder.jpg')
        $('#choose_name_fileid').text('Choose file');
    }
}

// load image
var image_base64 = '';
readURL = (input) => {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.addEventListener('load', (e) => {

            image_base64 = e.target.result;
            // console.log(image_base64);
            $('#food_image_change_id')
                .attr('src', e.target.result)
        })
        reader.readAsDataURL(input.files[0]);
    }
    $('#choose_name_fileid').text(input.files[0].name);
}

check_food_name = (id, food_name) => {
    $.ajax({
        type: 'POST',
        url: '/admin/category/edit/check_name',
        dataType: 'json',
        data: {
            food_name
        },
        success: (msg_back) => {
            // console.log(msg_back);
            add_success_alert_input(msg_back, id)
        },
        error: (msg_back) => {
            // console.log(msg_back);
            add_error_alert_input(msg_back, id)
        }
    })
}

New_food_data = (food_id, food_name, food_calories, food_quantity, food_price, food_image) => {
    // console.log('New food data : '+food_id,food_name,food_calories,food_quantity,food_price,image_base64);
    if (image_base64 == '') {
        image_base64 = old_image;
    }
    var food_new_data = {
        food_id,
        food_name,
        food_calories,
        food_quantity,
        food_price,
        image_base64
    };
    // console.log(food_new_data);

    $.ajax({
        type: 'PATCH',
        url: '/admin/category/edit',
        dataType: 'json',
        data: food_new_data,
        success: (msg_back) => {
            // console.log(msg_back);
            // refresh_page(msg_back.success);
            alert_popup(msg_back);
            // $.alert({
            //     title: 'แจ้งเตือน!',
            //     content: msg_back.success,
            //     type: 'green',
            //     buttons: {
            //         ok: {
            //             text: "ยืนยัน",
            //             btnClass: 'btn-primary',
            //             keys: ['enter'],
            //             action: function () {
                            
                
            //             }
            //         }}
            // });
        },
        error: (msg_back) => {
            // console.log(msg_back);
            // alert(msg_back.responseJSON.error);
            alert_popup(msg_back.responseJSON);
            // $.alert({
            //     title: 'แจ้งเตือน!',
            //     content: msg_back.responseJSON.error,
            //     type: 'red',
            //     buttons: {
            //         ok: {
            //             text: "ยืนยัน",
            //             btnClass: 'btn-primary',
            //             keys: ['enter'],
            //             action: function () {
            //                 setTimeout(() => {
            //                     window.location.reload();
            //                 }, 100)
            //             }
            //         }}
            // });
            
        }
    })
}

modal_delete_food_confirm = (food_id) => {
    $.confirm({
        title: 'ลบรายการอาหาร',
        content: 'ต้องการลบรายการอาหาร',
        buttons: {
            ยืนยัน: {
                btnClass: 'btn-primary',
                action: function () {
                    delete_food(food_id)
                }
            },
            ยกเลิก:{
                btnClass: 'btn-secondary',
                action: function () {

                }
            } 
        }
    });
}

delete_food = (food_id) => {
    $.ajax({
        type: 'DELETE',
        url: '/admin/category/delete',
        dataType: 'json',
        data: {
            food_id
        },
        success: (msg_back) => {
            // console.log(msg_back);
            // alert(msg_back.success);
            // alert_popup( msg_back.success);
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
        error: (msg_back) => {
            // console.log(msg_back);
        }
    })
}


// category add page script //

    // add new row and check food id // 

    var id_list_only = [];
    get_food_list_in_category = () => {
        $.get('/admin/category/add/get_id_list',(id_list) => {
            // console.log('ID list already : ',id_list.food_id_list);
            // var id_list_only = [];
            id_list.food_id_list.forEach(data => {
                //  // console.log("food data list : ",data);
                id_list_only.push(data.food_id)
            });
               
           
            // console.log("food id list : ",id_list_only);
            
            // id_list.forEach(data => {
            //     id_list_only.push(data.food_id)
            // })
            // return  id_list_only;
        })
    }
    
        // add row food list 
var id_list_only = [];
var counter = 0;
$("#addrow").on("click", function () {
        // check id list
        
        var id_available = '';
        // console.log("food id list : ",id_list_only);
        for (var i = 1; i ; i++) {
            if(jQuery.inArray(i, id_list_only) != -1) {
                // console.log(i+" is in food id list array");
                // $('#test').html('<p>'+i+' This num is in array </p>')
            } else {
                // console.log(i+" is NOT in food id list array");
                // $('#test').html('<p>'+i+' This num is NOT in array </p>')
                id_list_only.push(i)
                id_available = i;
                break;
            } 
        }

        var newRow = $("<tr>");
        var cols = "";

        cols += '<td><input type="text" class="form-control" name="food_id" id="food_id' + counter + '" value="'+id_available+'" onchange="auto_check_food_id(this.name,this.value,this.id)" readonly/></td>';
        cols += '<td><input type="text" class="form-control" name="food_name" id="food_name' + counter + '" onchange="auto_check_food_name(this.name,this.value,this.id)"/></td>';
        cols += '<td><input type="text" class="form-control" name="food_price"/></td>';
        cols += '<td><input type="text" class="form-control" name="food_calories"/></td>';
        cols += '<td><input type="text" class="form-control" name="food_quantity"/></td>';
        // cols += '<td><input type="text" class="form-control" name="food_image"/></td>';

        cols +=
            // '<td><input type="button" class="ibtnDel btn btn-md btn-danger" value="ลบ"></td>';
            '<td><button class="ibtnDel btn btn-md btn-danger" value="'+id_available+'">ลบ</button></td>';
            
        newRow.append(cols);
        $("table.order-list").append(newRow);
        counter++;
    });

    $("table.order-list").on("click", ".ibtnDel", function (event) {
        // console.log('Delete id : ',$(this).val());
        var select_id_del = $(this).val();
        id_list_only = jQuery.grep(id_list_only, function(value) {
                return value != select_id_del;
        })
        // console.log('Deleted id : ',id_list_only);
        $(this).closest("tr").remove();
        
        
        counter -= 1
    });

function calculateRow(row) {
    var price = +row.find('input[name^="price"]').val();

}

function calculateGrandTotal() {
    var grandTotal = 0;
    $("table.order-list").find('input[name^="price"]').each(function () {
        grandTotal += +$(this).val();
    });
    $("#grandtotal").text(grandTotal.toFixed(2));
}


// submit food data
$(function () {
    $('#btnsubmit').click(function () {
        // build json
        var food_data = $('#table_id tbody tr').map(function () {

            var food_id = $('td', this).eq(0).find('input').val(), // used
                food_name = $('td', this).eq(1).find('input').val(),
                food_price = $('td', this).eq(2).find('input').val(),
                food_calories = $('td', this).eq(3).find('input').val(),
                food_quantity = $('td', this).eq(4).find('input').val(),
                food_image = $('td', this).eq(5).find('input').val();

            return {
                "food_id": food_id,
                "food_name": food_name,
                "food_price": food_price,
                "food_calories": food_calories,
                "food_quantity": food_quantity,
                "food_image": food_image
            }
        }).get();

        // console.log(food_data);

        $.ajax({
            type: 'POST',
            url: '/admin/category/add',
            dataType: 'json',
            data: {
                food_data
            },
            success: (msg_back) => {
                // console.log(msg_back);
                
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
                                window.location = '/admin/category';
                                // setTimeout(() => {
                                //     window.location.reload();
                                // }, 100)
                            }
                        }}
                });
            },
            error: (msg_back) => {
                // console.log(msg_back);
                alert_popup(msg_back.responseJSON);
            }
        })
    });

});

// submit auto check
auto_check_food_id = (name_food_data, food_id, id) => {
    // console.log(name_food_data + ' / ' + food_id);

    $.ajax({
        type: 'POST',
        url: '/admin/category/add/auto_check',
        dataType: 'json',
        data: {
            name_food_data,
            food_id
        },
        success: (msg_back) => {
            // console.log(msg_back);
            add_success_alert_input(msg_back, id)
        },
        error: (msg_back) => {
            // console.log(msg_back);
            add_error_alert_input(msg_back, id)

        }
    })
}

auto_check_food_name = (name_food_data, food_name, id) => {
    // console.log(name_food_data + ' / ' + food_name);
    $.ajax({
        type: 'POST',
        url: '/admin/category/add/auto_check',
        dataType: 'json',
        data: {
            name_food_data,
            food_name
        },
        success: (msg_back) => {
            // console.log(msg_back);
            add_success_alert_input(msg_back, id)
        },
        error: (msg_back) => {
            // console.log(msg_back);
            add_error_alert_input(msg_back, id)
        }
    })
}

add_success_alert_input = (msg, id) => {
    $('#' + id).removeClass('input-group-text , input-alert-error').addClass('input-alert-success')
}

add_error_alert_input = (msg, id) => {
    $('#' + id).removeClass('input-group-text , input-alert-success').addClass('input-alert-error')
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
            content: msg.success,
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