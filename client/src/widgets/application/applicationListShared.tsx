import type { ReactNode } from 'react';
import type { ApplicationWithJobPost } from 'entities/application/model/types/application.type';
import { AcceptOfferButton } from 'features/application/AcceptOfferButton';
import { AcceptApprovalButton } from 'features/application/AcceptApprovalButton';
import { PendingEmployerConfirmNotice } from 'features/application/PendingEmployerConfirmNotice';
import { RejectOfferButton } from 'features/application/RejectOfferButton';
import { isPendingAfterOfferAccept } from 'entities/application/lib/pendingFlowStorage';
import { CardActionGroup } from 'shared/ui/CardActionGroup/CardActionGroup';

export function groupApplicationsByStatus(applications: ApplicationWithJobPost[]) {
  return applications.reduce<Record<string, ApplicationWithJobPost[]>>((acc, app) => {
    const status = app.applicationStatus;
    if (!acc[status]) acc[status] = [];
    acc[status].push(app);
    return acc;
  }, {});
}

export function renderApplicationHeaderActions(app: ApplicationWithJobPost): ReactNode {
  const status = app.applicationStatus;

  if (status === 'OFFERED') {
    return (
      <CardActionGroup>
        <AcceptOfferButton applicationId={app.applicationId} />
        <RejectOfferButton applicationId={app.applicationId} />
      </CardActionGroup>
    );
  }
  if (status === 'PENDING') {
    const waitingEmployer = isPendingAfterOfferAccept(app.applicationId);
    if (waitingEmployer) {
      return (
        <>
          <PendingEmployerConfirmNotice />
          <CardActionGroup>
            <RejectOfferButton applicationId={app.applicationId} />
          </CardActionGroup>
        </>
      );
    }
    return (
      <CardActionGroup>
        <AcceptApprovalButton applicationId={app.applicationId} />
        <RejectOfferButton applicationId={app.applicationId} />
      </CardActionGroup>
    );
  }
  if (status === 'APPLIED') {
    return (
      <CardActionGroup>
        <RejectOfferButton applicationId={app.applicationId} />
      </CardActionGroup>
    );
  }
  if (status === 'HIRED') {
    return (
      <CardActionGroup>
        <RejectOfferButton applicationId={app.applicationId} variant="hired" />
      </CardActionGroup>
    );
  }
  return undefined;
}
