import { FC } from 'react';
import styled from 'styled-components';

interface Alert {
  type: 'success' | 'error' | 'warning';
  message: string;
}

interface AlertContainerProps {
  alerts: Alert[];
}

const AlertContainerWrapper = styled.div`
  margin-bottom: 1rem;
`;

const AlertWrapper = styled.div<{ type: 'success' | 'error' | 'warning' }>`
  padding: 0.75rem 1.25rem;
  margin-bottom: 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  color: #fff;
  background-color: ${({ type }) =>
    type === 'success'
      ? '#28a745'
      : type === 'error'
      ? '#dc3545'
      : type === 'warning'
      ? '#ffc107'
      : 'transparent'};
`;

const AlertMessage = styled.div`
  font-size: 0.875rem;
  font-weight: bold;
`;

const AlertContainer: FC<AlertContainerProps> = ({ alerts }) => {
  return (
    <AlertContainerWrapper>
      {alerts.length > 0 && (
        <>
          {alerts.map((alert, index) => (
            <AlertWrapper key={index} type={alert.type}>
              <AlertMessage>{alert.message}</AlertMessage>
            </AlertWrapper>
          ))}
        </>
      )}
    </AlertContainerWrapper>
  );
};

export default AlertContainer;