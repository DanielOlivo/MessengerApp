import { useForm, SubmitHandler } from 'react-hook-form'
import { ErrorMessage } from '@hookform/error-message'
import { Credentials } from 'shared/src/Types'
import { fetchToken, register as regUser } from '../thunks'
import { useApDispatch, useAppSelector } from '../../app/hooks'
import { selectAuthStatus, selectIsOnWaiting } from '../selectors'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { autologin } from '../slice'

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

    return (
        <div className='flex flex-col justify-center items-center w-full h-full'>
            <h1>Messenger App</h1>

            <h3>{onLogin ? "Login" : "Register"}</h3>
            <form 
                onSubmit={handleSubmit(onSubmit)}
                className='w-2/3 border border-slate-300 rounded-xl p-4 flex flex-col justify-start items-start'
            >

                <div className='flex flex-col justify-start items-start'>
                    <div className='flex flex-row justify-start items-center'>
                        <label>Username:</label>
                        <input 
                            aria-label='username-field'
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
                    <ErrorMessage 
                        errors={errors}
                        name='username'
                        render={({messages}) =>
                            messages && Object.entries(messages).map(([type, message]) =>
                                <p key={type} className='text-red-500'>{message}</p>
                            )
                        }
                    />
                </div>

                <div className='mt-3 flex flex-col justify-start items-start'>
                    <div className='flex flex-row justify-start items-center'>
                        <label>Password:</label>
                        <input 
                            aria-label='password-field'
                            {...register('password', { 
                                required: 'Password is required', 
                                minLength: {
                                    value: 4,
                                    message: 'Password must contain at least 4 symbols'
                                }
                            })} 
                        />
                    </div>
                    <ErrorMessage 
                        errors={errors}
                        name='password'
                        render={({messages}) =>
                            messages && Object.entries(messages).map(([type, message]) =>
                                <p key={type} className='text-red-500'>{message}</p>
                            )
                        }
                    />
                </div>

                <input aria-label='submit-button' type='submit' disabled={onWaiting} className='mt-3' />

                <div className='h-7 flex flex-row justify-start items-center'>
                    
                    {onLogin && (
                        <div className='flex flex-row justify-start items-center'>
                            <p>or</p>
                            <button className='h-6 ml-2'>Enter without login</button>
                        </div>
                    )}
                </div>

            </form> 

            <button
                aria-label='switch-button'
                onClick={() => setOnLogin(!onLogin)} 
            >{onLogin ? "Register" : "Login"}?</button>
        </div>
    )
}
