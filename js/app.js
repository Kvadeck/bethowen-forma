$(function () {

    // Инициализация функций
    maskWraper.call(this, 'phone')
    formValidation.call(this)

    // Валидация полей формы
    function formValidation() {
        jQuery("#contactForm").validator().on("submit", function (event) {
            // В случае ошибок заполненной формы
            if (event.isDefaultPrevented()) {
                formErrorAnimate();
                // Если все поля заполнены правильно
            } else {
                event.preventDefault();
                submitForm();
            }
        });
    }

    // Маска для телефона с аргументом для идентификатора поля
    function maskWraper(inputId) {

        var input = document.getElementById(inputId)
        var keyCode,
            eventsArr = ["input", "focus", "blur", "keydown"];

        function mask(event) {

            event.keyCode && (keyCode = event.keyCode);
            var pos = this.selectionStart;
            if (pos < 3) event.preventDefault();

            var matrix = "+7 (___) ___-__-__",
                i = 0,
                def = matrix.replace(/\D/g, ""),
                val = this.value.replace(/\D/g, ""),

                new_value = matrix.replace(/[_\d]/g, function (a) {
                    return (i < val.length) ? val.charAt(i++) || def.charAt(i) : a
                });

            i = new_value.indexOf("_");
            if (i != -1) {
                i < 5 && (i = 3);
                new_value = new_value.slice(0, i)
            }
            var reg = matrix.substr(0, this.value.length).replace(/_+/g,
                function (a) {
                    return "\\d{1," + a.length + "}"
                }).replace(/[+()]/g, "\\$&");

            reg = new RegExp("^" + reg + "$");
            if (!reg.test(this.value) || this.value.length < 5 || keyCode > 47 && keyCode < 58) this.value = new_value;
            if (event.type == "blur" && this.value.length < 5) this.value = ""
        }

        for (let i = 0; i < eventsArr.length; i++) {
            let eventEl = eventsArr[i]
            input.addEventListener(eventEl, mask, false)
        }
    }

    // Анимация формы при ошибке
    function formErrorAnimate() {
        jQuery("#contactForm").removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            jQuery(this).removeClass();
        });
    }

    // Сообщение при отправке формы
    function submitMSG(valid, msg) {
        if (valid) {
            var msgClasses = "h3 text-center tada animated text-success";
            jQuery("#contactForm").replaceWith(jQuery("#contactForm").addClass(msgClasses).text(msg));
        } else {
            var msgClasses = "h3 text-center text-danger";
            jQuery("#msgSubmit").removeClass().addClass(msgClasses).text(msg);
        }
    }

    // Отображение ошибки в объекте при отправке Ajax
    function jqXHRErrorText(jqXHR, exception) {

        let msg = ''

        if (jqXHR.status === 0) {
            msg = 'Not connect.\n Verify Network.';
        } else if (jqXHR.status == 404) {
            msg = 'Requested page not found. [404]';
        } else if (jqXHR.status == 500) {
            msg = 'Internal Server Error [500].';
        } else if (jqXHR.status == 405) {
            msg = 'Method not Allowed [405].';
        } else if (exception === 'parsererror') {
            msg = 'Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            msg = 'Time out error.';
        } else if (exception === 'abort') {
            msg = 'Ajax request aborted.';
        } else {
            msg = 'Uncaught Error.\n' + jqXHR.responseText;
        }
        return msg;

    }

    // Обработчик объекта для отправки
    function handlerObjSend(obj, formId) {

        jQuery(`${formId} input, ${formId} select, ${formId} textarea`).each(
            function () {
                let first = $(this)[0];

                let id = first.id,
                    value = $(this).val();

                obj[id] = value

                if (id == 'name') { obj[id] = value.trim() }
                if (id == 'phone') { obj[id] = value.replace(/[^+0-9.]/g, "") }
                if (id == 'agree') { obj[id] = (first.checked) ? 'y' : 'n' }

            }
        );
    }

    // Вывод результата ответа от сервера в консоль
    function submitErrorData(msg, errorcode) {
        return {
            State: errorcode,
            Msg: msg
        }
    }

    // Обработчик отправки формы
    function submitForm() {

        let dataObj = {},
            formId = '#contactForm'

        handlerObjSend(dataObj, formId)

        // Вывод в консоль отправляемого объекта (опционально)
        // console.log('sended Object', dataObj)

        jQuery.ajax({

            type: "POST",
            url: "http://localhost:8080/testSend.php",
            // contentType: "application/json; charset=utf-8",
            data: JSON.stringify(dataObj),
            // dataType: "json",
            success: function () {
                // В случае успеха
                submitMSG(true, 'Форма успешно отправлена.');
                console.log(submitErrorData('success', 1))
            },
            error: function (jqXHR, exception) {
                // В случае ошибки
                submitMSG(false, 'При отправке возникли ошибки');
                console.log(submitErrorData(jqXHRErrorText(jqXHR, exception), 0))
            }
        });
    }

});

