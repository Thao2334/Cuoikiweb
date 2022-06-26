// const signIn = document.querySelector("#signInButton");
// const signUp = document.querySelector("#signUpButton");
// const signInForm = document.querySelector(".container .sign-in-form");
// const signUpForm = document.querySelector(".container .sign-up-form");
// const overlay_container = document.querySelector(
//   ".container .overlay-container"
// );
// const overlay = document.querySelector(
//   ".container .overlay-container .overlay"
// );

// signIn.addEventListener("click", () => {
//   overlay_container.style.transform = "translateX(100%)";
//   overlay.style.transform = "translateX(-50%)";
//   signInForm.classList.add("active");
//   signUpForm.classList.remove("active");
// });
// signUp.addEventListener("click", () => {
//   overlay_container.style.transform = "translateX(0)";
//   overlay.style.transform = "translateX(0)";
//   signUpForm.classList.add("active");
//   signInForm.classList.remove("active");
// });
// Đối tượng `Validator`
function Validator(options) {
  function getParent(element, selector) {
      while (element.parentElement) {
          if (element.parentElement.matches(selector)) {
              return element.parentElement;
          }
          element = element.parentElement;
      }
  }

  var selectorRules = {};

  // Hàm thực hiện validate
  function validate(inputElement, rule) {
      var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
      var errorMessage;

      // Lấy ra các rules của selector
      var rules = selectorRules[rule.selector];
      
      // Lặp qua từng rule & kiểm tra
      // Nếu có lỗi thì dừng việc kiểm
      for (var i = 0; i < rules.length; ++i) {
          switch (inputElement.type) {
              case 'radio':
              case 'checkbox':
                  errorMessage = rules[i](
                      formElement.querySelector(rule.selector + ':checked')
                  );
                  break;
              default:
                  errorMessage = rules[i](inputElement.value);
          }
          if (errorMessage) break;
      }
      
      if (errorMessage) {
          errorElement.innerText = errorMessage;
          getParent(inputElement, options.formGroupSelector).classList.add('invalid');
      } else {
          errorElement.innerText = '';
          getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
      }

      return !errorMessage;
  }

  // Lấy element của form cần validate
  var formElement = document.querySelector(options.form);
  if (formElement) {
      // Khi submit form
      formElement.onsubmit = function (e) {
          e.preventDefault();

          var isFormValid = true;

          // Lặp qua từng rules và validate
          options.rules.forEach(function (rule) {
              var inputElement = formElement.querySelector(rule.selector);
              var isValid = validate(inputElement, rule);
              if (!isValid) {
                  isFormValid = false;
              }
          });

          if (isFormValid) {
              // Trường hợp submit với javascript
              if (typeof options.onSubmit === 'function') {
                  var enableInputs = formElement.querySelectorAll('[name]');
                  var formValues = Array.from(enableInputs).reduce(function (values, input) {
                      
                      switch(input.type) {
                          case 'radio':
                              values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                              break;
                          case 'checkbox':
                              if (!input.matches(':checked')) {
                                  values[input.name] = '';
                                  return values;
                              }
                              if (!Array.isArray(values[input.name])) {
                                  values[input.name] = [];
                              }
                              values[input.name].push(input.value);
                              break;
                          case 'file':
                              values[input.name] = input.files;
                              break;
                          default:
                              values[input.name] = input.value;
                      }

                      return values;
                  }, {});
                  options.onSubmit(formValues);
              }
              // Trường hợp submit với hành vi mặc định
              else {
                  formElement.submit();
              }
          }
      }

      // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input, ...)
      options.rules.forEach(function (rule) {

          // Lưu lại các rules cho mỗi input
          if (Array.isArray(selectorRules[rule.selector])) {
              selectorRules[rule.selector].push(rule.test);
          } else {
              selectorRules[rule.selector] = [rule.test];
          }

          var inputElements = formElement.querySelectorAll(rule.selector);

          Array.from(inputElements).forEach(function (inputElement) {
             // Xử lý trường hợp blur khỏi input
              inputElement.onblur = function () {
                  validate(inputElement, rule);
              }

              // Xử lý mỗi khi người dùng nhập vào input
              inputElement.oninput = function () {
                  var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                  errorElement.innerText = '';
                  getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
              } 
          });
      });
  }

}



// Định nghĩa rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi => Trả ra message lỗi
// 2. Khi hợp lệ => Không trả ra cái gì cả (undefined)
Validator.isRequired = function (selector, message) {
  return {
      selector: selector,
      test: function (value) {
          return value ? undefined :  message || 'Please type in this input'
      }
  };
}

Validator.isEmail = function (selector, message) {
  return {
      selector: selector,
      test: function (value) {
          var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          return regex.test(value) ? undefined :  message || 'You must put email';
      }
  };
}

Validator.minLength = function (selector, min, message) {
  return {
      selector: selector,
      test: function (value) {
          return value.length >= min ? undefined :  message || `Please type ${min} character`;
      }
  };
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
      selector: selector,
      test: function (value) {
          return value === getConfirmValue() ? undefined : message || 'Typed value is not true';
      }
  }
}
