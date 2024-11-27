const form = document.querySelector("#paymentForm");

form.addEventListener("submit", async function (event) {
    event.preventDefault();
    let fullNameField = event.target["fullName"];
    let emailField = event.target["email"];
    let phoneField = event.target["phone"];
    let commentField = event.target["comment"];
    let recurrentField = event.target["recurrent"];

    try {
        const formData = {
            fullName: fullNameField.value,
            email: emailField.value,
            phone: phoneField.value,
            comment: commentField.value,
            recurrent: recurrentField.value,
        }
        const propsForPayment = Object.assign({}, formData);
        delete propsForPayment.recurrent;
        const payments = new cp.CloudPayments();

        payments.oncomplete = (result) => {
            console.log('result', result);
        }

        if (recurrentField.checked) {
            const receipt = {
                Items: [ //товарные позиции
                    {
                        label: 'Донат тест', //наименование товара
                        price: 1000.00, //цена
                        quantity: 1.00, //количество
                        amount: 1000.00, //сумма
                        vat: 0, //ставка НДС
                        method: 0, // тег-1214 признак способа расчета - признак способа расчета
                        object: 0, // тег-1212 признак предмета расчета - признак предмета товара, работы, услуги, платежа, выплаты, иного предмета расчета
                    }
                ],
                taxationSystem: 0, //система налогообложения; необязательный, если у вас одна система налогообложения
                email: formData.email, //e-mail покупателя, если нужно отправить письмо с чеком
                phone: formData.phone, //телефон покупателя в любом формате, если нужно отправить сообщение со ссылкой на чек
                isBso: false, //чек является бланком строгой отчетности
                amounts: {
                    electronic: 1000.00, // Сумма оплаты электронными деньгами
                    advancePayment: 0.00, // Сумма из предоплаты (зачетом аванса) (2 знака после запятой)
                    credit: 0.00, // Сумма постоплатой(в кредит) (2 знака после запятой)
                    provision: 0.00 // Сумма оплаты встречным предоставлением (сертификаты, др. мат.ценности) (2 знака после запятой)
                }
            };

            const data = { //содержимое элемента data
                CloudPayments: {
                    CustomerReceipt: receipt, //чек для первого платежа
                    recurrent: {
                        interval: 'Month',
                        period: 1,
                        customerReceipt: receipt //чек для регулярных платежей
                    }
                },
                ...propsForPayment
            };

            await payments.pay("charge", { // options
                publicId: 'pk_aff17de359b486f45c12b4e4fdab0',
                accountId: formData.email,
                description: 'Донат тест',
                amount: 1000,
                currency: 'RUB',
                invoiceId: 1234567,
                data
            })
        } else {
            await payments.pay("charge", { // options
                publicId: 'pk_aff17de359b486f45c12b4e4fdab0',
                description: 'Донат тест',
                amount: 5000,
                currency: 'RUB',
                invoiceId: 1234567,
                data: propsForPayment
            })
        }
    } catch (e) {
        console.error(e);
    }
});