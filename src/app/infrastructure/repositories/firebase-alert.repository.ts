import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { FirebaseAdapter } from '../adapters/firebase.adapter';
import { IAlertRepository, AlertFilters } from '@app/domain/repositories/alert.repository';
import { AlertLogModel, IAlertLog, EntityType } from '@app/domain';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAlertRepository implements IAlertRepository {
  private readonly firestore: Firestore = FirebaseAdapter.getFirestore();

  async getAlertsByWorkspace(
    workspaceId: string,
    filters?: AlertFilters,
  ): Promise<AlertLogModel[]> {
    const alertsRef = collection(this.firestore, 'alert_logs');
    const constraints: QueryConstraint[] = [
      where('workspaceId', '==', workspaceId),
      orderBy('createdAt', 'desc'),
    ];

    if (filters?.entityType) {
      constraints.push(where('entityType', '==', filters.entityType));
    }
    if (filters?.daysBefore !== undefined) {
      constraints.push(where('daysBefore', '==', filters.daysBefore));
    }
    if (filters?.processed !== undefined) {
      constraints.push(where('processed', '==', filters.processed));
    }

    const q = query(alertsRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<IAlertLog, 'id'>;
      return new AlertLogModel({ ...data, id: doc.id });
    });
  }

  async getAlertsByEntity(
    workspaceId: string,
    entityId: string,
    entityType: EntityType,
  ): Promise<AlertLogModel[]> {
    const alertsRef = collection(this.firestore, 'alert_logs');
    const q = query(
      alertsRef,
      where('workspaceId', '==', workspaceId),
      where('entityId', '==', entityId),
      where('entityType', '==', entityType),
      orderBy('createdAt', 'desc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<IAlertLog, 'id'>;
      return new AlertLogModel({ ...data, id: doc.id });
    });
  }

  async getCriticalAlerts(
    workspaceId: string,
    daysThreshold: number = 7,
  ): Promise<AlertLogModel[]> {
    const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    const alertsRef = collection(this.firestore, 'alert_logs');
    const q = query(
      alertsRef,
      where('workspaceId', '==', workspaceId),
      where('daysBefore', '<=', daysThreshold),
      where('createdAt', '>=', sevenDaysAgo),
      orderBy('createdAt', 'desc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<IAlertLog, 'id'>;
      return new AlertLogModel({ ...data, id: doc.id });
    });
  }
}
