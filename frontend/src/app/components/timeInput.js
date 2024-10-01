import { set } from 'date-fns';
import { useState } from 'react';

const TimeInput = () => {
    const [hours, setHours] = useState('0');
    const [minutes, setMinutes] = useState('00');
    const [seconds, setSeconds] = useState('00');
    const [error, setError] = useState('');

    const validInput = (val) => {
        return val.replace(/[^0-9]+/g, '');
    };

    const setMax = (id) => {
        return id === 'hours' ? 23 : 59;
    };

    const throwErr = (mssg, inputId, invalid = false) => {
        const input = document.getElementById(inputId);
        if (invalid) {
            input.classList.add('invalid');
            setError(mssg);
        } else {
            input.classList.remove('invalid');
            setError('');
        }
    };

    const handleFocus = (e) => {
        if (e.target.value === '0' || e.target.value === '00') {
            e.target.value = '';
        }

        if (e.target.classList.contains('invalid')) {
            throwErr(error, e.target.id, true);
        } else {
            throwErr('', e.target.id);
        }
    };

    // const handleKeyUp = (e) => {
    //     const val = e.target.value;
    //     const max = setMax(e.target.id);

    //     e.target.value = validInput(val);

    //     if (e.target.value.length > 2) {
    //         e.target.value = e.target.value.substring(0, 2);
    //     }

    //     if (+e.target.value > max) {
    //         throwErr(`It can't be more than ${max} ${e.target.id}! Try again.`, e.target.id, true);
    //     } else {
    //         throwErr('', e.target.id);
    //     }

    //     switch (e.target.id) {
    //         case 'hours':
    //             setHours(e.target.value);
    //             break;
    //         case 'minutes':
    //             setMinutes(e.target.value);
    //             break;
    //         case 'seconds':
    //             setSeconds(e.target.value);
    //             break;
    //         default:
    //             break;
    //     }
    // };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div id="time_wrapper" className="transform scale-150">
                <div id="time_input" className="border-2 border-inactive p-2 flex items-center">
                    <label htmlFor="hours" className="flex flex-col items-center relative">
                        <input
                            type="number"
                            id="hours"
                            max={23}
                            min={0}
                            defaultValue={hours}
                            onFocus={handleFocus}
                            className="w-16 h-16 text-center text-lg border-none focus:outline-none"
                        />
                        <span className="text-xs absolute top-1 left-6">hours</span>
                    </label>
                    <span>:</span>
                    <label htmlFor="minutes" className="flex flex-col items-center relative">
                        <input
                            type="number"
                            id="minutes"
                            defaultValue={minutes}
                            max={59}
                            min={0}
                            onFocus={handleFocus}
                            className="w-16 h-16 text-center text-lg border-none focus:outline-none"
                        />
                        <span className="text-xs absolute top-1 left-5">minutes</span>
                    </label>
                    <span>:</span>
                    <label htmlFor="seconds" className="flex flex-col items-center relative">
                        <input
                            type="number"
                            id="seconds"
                            max={59}
                            min={0}
                            defaultValue={seconds}
                            onFocus={handleFocus}
                            className="w-16 h-16 text-center text-lg border-none focus:outline-none"
                        />
                        <span className="text-xs absolute top-1 left-5">seconds</span>
                    </label>
                </div>
            </div>
            <div id="error" className={`text-red-500 mt-4 ${error ? 'visible' : 'invisible'}`}>
                {error}
            </div>
        </div>
    );
};

export default TimeInput;
