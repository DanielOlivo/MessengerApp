import { useForm, SubmitHandler } from 'react-hook-form'
import { ErrorMessage } from '@hookform/error-message'
import { Credentials } from 'shared/src/Types'
import { fetchToken, register as regUser } from '../thunks'
import { useApDispatch, useAppSelector } from '../../app/hooks'
import { selectAuthStatus, selectIsOnWaiting } from '../selectors'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { autologin } from '../slice'
import backgroundImg from '../../assets/background1.svg'

export const Auth = () => {

    const dispatch = useApDispatch()
    const onWaiting = useAppSelector(selectIsOnWaiting)
    const [onLogin, setOnLogin] = useState<boolean>(true)

    const navigate = useNavigate()
    const isAuthenticated = useAppSelector(selectAuthStatus)

    const { 
        register, 
        handleSubmit ,
        formState: { errors }
    } = useForm<Credentials>({
        criteriaMode: 'all'
    })
    const onSubmit: SubmitHandler<Credentials> = (data) => {
        if(onLogin){
            dispatch(fetchToken(data))
        }
        else {
            dispatch(regUser(data))
        }
    }

    useEffect(() => {
        dispatch(autologin())
    }, [])

    useEffect(() => {
        if(isAuthenticated){
            navigate('/')
        }
    //eslint-disable-next-line
    }, [isAuthenticated])


    const primaryButtonStyle = 'text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2'
    const fieldContainerStyle = 'flex flex-row justify-start items-center border-b-2 border-slate-200'
    const fieldStyle = 'text-slate-200 bg-[rgba(0,0,0,0)] placeholder-slate-300 mx-4 w-full focus:outline-none'

    return (
        <div className='flex flex-row justify-center items-stretch w-full h-screen px-7 text-slate-200'>

                <div className='min-h-full text-[Montserrat] flex flex-col justify-center items-start mt-5'>
                    <h1
                        className='font-bold text-3xl' 
                    >Messenger App</h1>

                    <p
                        className='mt-6' 
                    >This is an example project which utilizes Socket.io</p>

                    <ol className='mt-6'>
                        <li>
                            <a href='http://github.com/DanielOlivo/MessengerApp'>Github</a>
                        </li>
                        <li>
                            <a href='https://www.linkedin.com/in/vitalii-masterov-412533233/'>Linkedin</a>
                        </li>
                    </ol>
                </div>

                <div className='ml-10 min-w-96 flex flex-col justify-center items-center font-[Montserrat]'>

                    <h3 className='font-bold text-xl'>{onLogin ? "Sign in" : "Sign up"}</h3>

                    <form 
                        onSubmit={handleSubmit(onSubmit)}
                        className='w-2/3 p-4 flex flex-col justify-start items-center'
                    >

                        <div className='flex flex-col justify-start items-start'>
                            <div className={fieldContainerStyle}>
                                {/* <label className='font-[Montserrat] font-medium'>Username:</label> */}
                                <input 
                                    aria-label='username-field'
                                    placeholder='Username'
                                    className={fieldStyle} 
                                    {
                                        ...register('username', { 
                                        required: 'Username is required', 
                                        minLength: {
                                            value: 4,
                                            message: "Password size must be at least 4 symbols"
                                        },
                                        pattern: {
                                            value: /[a-zA-z][a-zA-Z0-9]+/,
                                            message: "Username should start with a letter and contain only letters or digits"
                                        }
                                    })} 
                                />
                            </div> 
                            {errors.username ? null : <div className='h-9 w-2'/>}
                            <ErrorMessage 
                                errors={errors}
                                name='username'
                                render={({messages}) =>
                                    messages && Object.entries(messages).map(([type, message]) =>
                                        <p key={type} className='h-9 text-orange-500'>{message}</p>
                                    )[0]
                                }
                            />
                        </div>

                        <div className='mt-3 flex flex-col justify-start items-start'>
                            <div className={fieldContainerStyle}>
                                <input 
                                    aria-label='password-field'
                                    className={fieldStyle}
                                    type='password'
                                    placeholder='password'
                                    {...register('password', { 
                                        required: 'Password is required', 
                                        minLength: {
                                            value: 4,
                                            message: 'Password must contain at least 4 symbols'
                                        }
                                    })} 
                                />
                            </div>
                            {errors.password ? null : <div className='h-9 w-2'/>}
                            <ErrorMessage 
                                errors={errors}
                                name='password'
                                render={({messages}) =>
                                    messages && Object.entries(messages).map(([type, message]) =>
                                        <p key={type} className='h-9 text-orange-500'>{message}</p>
                                    )[0]
                                }
                            />
                        </div>

                        <button 
                            className={'mt-3 ' + primaryButtonStyle}
                            aria-label='submit-button' 
                            type='submit' 
                            disabled={onWaiting}
                        >{onLogin ? 'Login' : 'Sign up'}</button>

                        <div className='h-7 flex flex-col justify-start items-center'>
                            
                            {onLogin && (
                                <div className='flex flex-col justify-start items-center'>
                                    <p>or</p>
                                    <button 
                                        className={'mt-2 ' + primaryButtonStyle}
                                    >Enter without login</button>
                                </div>
                            )}
                        </div>

                    </form> 

                    <button
                        aria-label='switch-button'
                        onClick={() => setOnLogin(!onLogin)} 
                        className='mt-8'
                    >{onLogin ? "Signup" : "Signin"}?</button>
                </div>
            <div className='absolute top-0 left-0 w-full h-full overflow-hidden -z-50'>
                <img src={backgroundImg} className='w-full' />
            </div>
        </div>
    )
}
