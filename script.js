'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Chen Qian Hui',
  nickName: '陈钱惠',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 210628,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-10-20T14:43:26.374Z',
    '2023-10-21T18:49:59.371Z',
    '2023-10-19T12:01:20.894Z',
  ],
  currency: 'JPY',
  locale: 'ja-JP', // de-DE
};

const account2 = {
  owner: 'Zhang Wei Bin',
  nickName: '张伟彬',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 210805,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2023-10-20T14:43:26.374Z',
    '2023-10-21T18:49:59.371Z',
    '2023-10-10T12:01:20.894Z',
  ],
  currency: 'CNY',
  locale: 'zh-Hans-CN',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
//生成用户名
const createUsernames = accounts => {
  accounts.forEach(acc => {
    const userName = acc.owner
      .toLowerCase()
      .split(' ')
      .map(str => str[0])
      .join('');
    acc.userName = userName;
  });
};
createUsernames(accounts);

//给格式化日期
const formatDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return '今天';
  if (daysPassed === 1) return '昨天';
  if (daysPassed <= 7) return `${daysPassed} 天前`;

  return new Intl.DateTimeFormat(locale).format(date);
};

//格式化货币
const formatCur = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};

//更新ui
const updateUI = acc => {
  containerApp.style.opacity = 0;

  setTimeout(() => {
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `欢迎您，${acc.nickName}! 🐱`;
  }, 500);

  displayMovements(acc);

  calcDisplayBalance(acc);

  calcDisplaySummary(acc);
};

//展示list
const displayMovements = (acc, sort = false) => {
  containerMovements.innerHTML = '';

  //通过set建立联系
  const movementSet = new Map();
  acc.movements.forEach((mov, i) => {
    movementSet.set(mov, acc.movementsDates[i]);
  });

  //转成想要的数组进行排序
  const movements = sort
    ? Array.from(movementSet).sort((a, b) => a[0] - b[0])
    : Array.from(movementSet);

  movements.forEach((mov, i) => {
    const type = mov[0] > 0 ? 'deposit' : 'withdrawal';
    const typeName = mov[0] > 0 ? '收入' : '支出';
    const value = formatCur(mov[0], acc.locale, acc.currency);

    const dateFormat = formatDate(new Date(mov[1]), acc.locale);
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${
      i + 1
    } ${typeName}</div>
    <div class="movements__date">${dateFormat}</div>
    <div class="movements__value">${value}</div>
  </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//计算并展示余额
const calcDisplayBalance = acc => {
  const balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  acc.balance = balance;
  labelBalance.textContent = formatCur(balance, acc.locale, acc.currency);
};

//计算并展示in，come和interest
const calcDisplaySummary = acc => {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

//生成计时器
const startLogoutTimer = () => {
  const tick = () => {
    const hour = String(Math.trunc(time / 60)).padStart(2, 0);
    const minute = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${hour} : ${minute}`;

    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `登录吧，家人们！！！📖`;
    }

    time--;
  };

  let time = 300;

  const timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAcc, timer;

//伪登录
// currentAcc = account1;
// updateUI(currentAcc);
// if (timer) clearInterval(timer);
// timer = startLogoutTimer();

//登录
btnLogin.addEventListener('click', e => {
  e.preventDefault();

  const userName = inputLoginUsername.value;
  const pin = +inputLoginPin.value;

  currentAcc = accounts.find(acc => acc.userName === userName);
  if (!currentAcc) alert('没有当前用户');
  else {
    //校验
    if (currentAcc?.userName === userName && currentAcc.pin === pin) {
      //显示ui
      updateUI(currentAcc);

      //展示时间
      const options = {
        hour: 'numeric',
        minute: 'numeric',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      };
      const date = new Intl.DateTimeFormat(currentAcc.locale, options).format(
        new Date()
      );
      labelDate.textContent = `登录时间： ${date}`;

      //开启时间计时器
      if (timer) clearInterval(timer);
      timer = startLogoutTimer();
    } else {
      alert('输入用户名和pin失败');
    }
  }

  //清空失焦
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();
});

//排序
let sort = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();

  displayMovements(currentAcc, !sort);
  sort = !sort;
});

//转账
btnTransfer.addEventListener('click', e => {
  e.preventDefault();

  const transsferAcc = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );
  const amount = +inputTransferAmount.value;
  if (!transsferAcc) alert('没有该用户可以去转账!');
  else {
    if (
      amount > 0 &&
      currentAcc.balance > amount &&
      transsferAcc !== currentAcc
    ) {
      //转账操作（金钱和日期）
      currentAcc.movements.push(-amount);
      transsferAcc.movements.push(amount);

      currentAcc.movementsDates.push(new Date(Date.now()).toISOString());
      transsferAcc.movementsDates.push(new Date(Date.now()).toISOString());

      //更新ui
      updateUI(currentAcc);

      //开启时间计时器
      if (timer) clearInterval(timer);
      timer = startLogoutTimer();
    }
  }

  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();
  inputTransferTo.blur();
});

//贷款
btnLoan.addEventListener('click', e => {
  e.preventDefault();

  const loas = Math.floor(inputLoanAmount.value);

  if (loas > 0 && currentAcc.movements.some(mov => mov >= loas * 0.1)) {
    currentAcc.movements.push(loas);
    currentAcc.movementsDates.push(new Date());

    updateUI(currentAcc);
  } else {
    alert('你的支付支出必须大于贷款的10% 😊');
  }

  inputLoanAmount.value = '';
  inputLoanAmount.blur();

  //开启时间计时器
  if (timer) clearInterval(timer);
  timer = startLogoutTimer();
});

//退出账号
btnClose.addEventListener('click', e => {
  e.preventDefault();

  const userName = inputCloseUsername.value;
  const pin = +inputClosePin.value;

  if (userName === currentAcc.userName && pin === currentAcc.pin) {
    currentAcc = undefined;

    containerApp.style.opacity = 0;
    labelWelcome.textContent = `登录吧，家人们！！！📖`;
  }

  inputCloseUsername.value = inputClosePin.value = '';
  inputCloseUsername.blur();
  inputClosePin.blur();

  //删除时间计时器
  if (timer) clearInterval(timer);
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
