import React from 'react';
import { Button, Checkbox, Form, Input, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
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
        const result = await dispatch(login(values));
        if (login.fulfilled.match(result)) {
            navigate('/dashboard');
        }
    };

    const handleFinishFailed = (errorInfo) => {
        console.log('Form validation failed:', errorInfo);
    };

    return (
        <div style={styles.page}>
            {/* Decorative background blobs */}
            <div style={styles.blobTop} />
            <div style={styles.blobBottom} />

            <div style={styles.card}>
                {/* Left panel */}
                <div style={styles.leftPanel}>
                    <div style={styles.brandMark}>
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.15)" />
                            <path d="M24 10 C16 10 10 18 10 24 C10 30 14 36 24 38 C34 36 38 30 38 24 C38 18 32 10 24 10Z" fill="rgba(255,255,255,0.25)" />
                            <path d="M24 14 C24 14 18 20 18 26 C18 30.4 20.6 34 24 35 C27.4 34 30 30.4 30 26 C30 20 24 14 24 14Z" fill="white" opacity="0.9" />
                            <path d="M24 35 L24 42" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                        </svg>
                    </div>
                    <h1 style={styles.brandName}>FreshHarvest</h1>
                    <p style={styles.brandTagline}>Hệ thống quản trị</p>
                    <div style={styles.dividerLine} />
                    <p style={styles.brandDescription}>
                        Quản lý kho hàng, sản phẩm và nhân sự một cách thông minh và hiệu quả.
                    </p>
                </div>

                {/* Right panel — form */}
                <div style={styles.rightPanel}>
                    <div style={styles.formHeader}>
                        <h2 style={styles.formTitle}>Đăng nhập</h2>
                        <p style={styles.formSubtitle}>Chào mừng trở lại! Vui lòng nhập thông tin của bạn.</p>
                    </div>

                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            showIcon
                            style={{ marginBottom: 24, borderRadius: 8 }}
                        />
                    )}

                    <Form
                        form={form}
                        layout="vertical"
                        name="login"
                        initialValues={{ remember: true }}
                        onFinish={handleFinish}
                        onFinishFailed={handleFinishFailed}
                        autoComplete="off"
                        requiredMark={false}
                    >
                        <Form.Item
                            label={<span style={styles.label}>Email</span>}
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                                placeholder="you@freshharvest.vn"
                                size="large"
                                style={styles.input}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={styles.label}>Mật khẩu</span>}
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                                placeholder="••••••••"
                                size="large"
                                style={styles.input}
                            />
                        </Form.Item>

                        <div style={styles.rememberRow}>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox style={{ color: '#6b7280', fontSize: 13 }}>
                                    Ghi nhớ đăng nhập
                                </Checkbox>
                            </Form.Item>
                            <a href="#" style={styles.forgotLink}>Quên mật khẩu?</a>
                        </div>

                        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={loading}
                                style={styles.submitButton}
                            >
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: {
        width: '100dvw',
        height: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0fdf4',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    blobTop: {
        position: 'absolute',
        top: '-120px',
        right: '-120px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,166,62,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    blobBottom: {
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,166,62,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    card: {
        display: 'flex',
        width: '860px',
        minHeight: '520px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
    },
    leftPanel: {
        width: '340px',
        flexShrink: 0,
        background: 'linear-gradient(145deg, #00A63E 0%, #007a2d 100%)',
        padding: '48px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        color: 'white',
    },
    brandMark: {
        marginBottom: '16px',
    },
    brandName: {
        margin: 0,
        fontSize: '28px',
        fontWeight: '700',
        color: 'white',
        letterSpacing: '-0.5px',
    },
    brandTagline: {
        margin: '4px 0 0',
        fontSize: '14px',
        color: 'rgba(255,255,255,0.75)',
        fontWeight: '400',
    },
    dividerLine: {
        width: '40px',
        height: '2px',
        background: 'rgba(255,255,255,0.4)',
        margin: '24px 0',
        borderRadius: '2px',
    },
    brandDescription: {
        margin: 0,
        fontSize: '14px',
        lineHeight: '1.7',
        color: 'rgba(255,255,255,0.8)',
    },
    rightPanel: {
        flex: 1,
        background: 'white',
        padding: '48px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    formHeader: {
        marginBottom: '32px',
    },
    formTitle: {
        margin: 0,
        fontSize: '24px',
        fontWeight: '700',
        color: '#111827',
        letterSpacing: '-0.3px',
    },
    formSubtitle: {
        margin: '6px 0 0',
        fontSize: '14px',
        color: '#6b7280',
    },
    label: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#374151',
    },
    input: {
        borderRadius: '8px',
        borderColor: '#e5e7eb',
        fontSize: '14px',
    },
    rememberRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '4px',
    },
    forgotLink: {
        fontSize: '13px',
        color: '#00A63E',
        textDecoration: 'none',
        fontWeight: '500',
    },
    submitButton: {
        background: '#00A63E',
        borderColor: '#00A63E',
        borderRadius: '8px',
        height: '44px',
        fontSize: '15px',
        fontWeight: '600',
        letterSpacing: '0.2px',
    },
};

export default Login;