import React from 'react';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuthError, selectAuthLoading } from '../../store/slices/AuthSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loading = useSelector(selectAuthLoading);
    const error = useSelector(selectAuthError);


    const handleFinish = async (values) => {
        // values = { email: '...', password: '...' }
        const result = await dispatch(login(values));

        console.log("values: ", values);

        if (login.fulfilled.match(result)) {
            message.success('Đăng nhập thành công!');
            navigate('/dashboard');
        }
    };

    // This is called when validation fails
    const handleFinishFailed = (errorInfo) => {
        console.log('Form validation failed:', errorInfo);
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     const formData = new FormData(e.target);

    //     const result = await dispatch(login({
    //         email: formData.get('email'),
    //         password: formData.get('password')
    //     }));

    //     if (login.fulfilled.match(result)) {
    //         navigate('/dashboard');
    //     }
    // }

    // const onFinish = values => {
    //     console.log('Success:', values);
    // };

    // const onFinishFailed = errorInfo => {
    //     console.log('Failed:', errorInfo);
    // };

    return (
        <div className='w-dvw h-dvh flex justify-center items-center bg-gray-200'>
            <Form
                form={form}
                className='bg-white w-1/3'
                name="basic"
                style={{ padding: "20px", borderRadius: "10px", display: "flex", flexDirection: 'column', justifyItems: 'center', gap: '1em' }}
                initialValues={{ remember: true }}
                onFinish={handleFinish}
                onFinishFailed={handleFinishFailed}
                autoComplete="off"
            >
                {error && (
                    <div className='error-message'>{error}</div>
                )}

                <Form.Item
                    style={{ margin: 0 }}
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Please input your email!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    style={{ margin: 0 }}
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password />
                </Form.Item>

                {/* <Form.Item
                    style={{ margin: 0 }} name="remember" valuePropName="checked" label={null}>
                    <Checkbox>Remember me</Checkbox>
                </Form.Item> */}

                <Form.Item label={null} style={{ margin: 0 }}>
                    <Button size='large' type="primary" htmlType="submit" block disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
};

export default Login;