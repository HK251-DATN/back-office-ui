// src/pages/UnauthorizedPage.jsx
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

function UnauthorizedPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <Result
                status="403"
                title="403"
                subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
                extra={[
                    <Button type="primary" key="home" onClick={() => navigate('/')}>
                        Về trang chủ
                    </Button>,
                    <Button type='default' key="change-account" onClick={() => navigate('/login')} >
                        Đổi tài khoản
                    </Button>,
                    <Button key="back" onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                ]}
            />
        </div>
    );
}

export default UnauthorizedPage;