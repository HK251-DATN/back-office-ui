// src/pages/NotFoundPage.jsx
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh'
        }}>
            <Result
                status="404"
                title="404"
                subTitle="Xin lỗi, trang bạn tìm kiếm không tồn tại."
                extra={
                    <Button type="primary" onClick={() => navigate('/')}>
                        Về trang chủ
                    </Button>
                }
            />
        </div>
    );
}

export default NotFoundPage;