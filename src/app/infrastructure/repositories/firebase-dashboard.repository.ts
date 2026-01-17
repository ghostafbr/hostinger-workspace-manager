import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, query, where } from 'firebase/firestore';
import { FirebaseAdapter } from '../adapters/firebase.adapter';
import { IDashboardRepository } from '@app/domain/repositories/dashboard.repository';
import { IDomain, ISubscription, Workspace } from '@app/domain';

@Injectable({
  providedIn: 'root',
})
export class FirebaseDashboardRepository implements IDashboardRepository {
  private readonly firestore: Firestore = FirebaseAdapter.getFirestore();

  async getWorkspacesByUserId(userId: string): Promise<Workspace[]> {
    const spacesSnapshot = await getDocs(
      query(collection(this.firestore, 'workspaces'), where('userId', '==', userId)),
    );
    return spacesSnapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return Workspace.fromFirestore(doc.id, data);
    });
  }

  async getDomainsByWorkspaceIds(workspaceIds: string[]): Promise<IDomain[]> {
    const allDomains: IDomain[] = [];
    const batchSize = 30;

    for (let i = 0; i < workspaceIds.length; i += batchSize) {
      const batch = workspaceIds.slice(i, i + batchSize);
      const snapshot = await getDocs(
        query(collection(this.firestore, 'domains'), where('workspaceId', 'in', batch)),
      );
      snapshot.docs.forEach((doc) => allDomains.push(doc.data() as IDomain));
    }
    return allDomains;
  }

  async getSubscriptionsByWorkspaceIds(workspaceIds: string[]): Promise<ISubscription[]> {
    const allSubscriptions: ISubscription[] = [];
    const batchSize = 30;

    for (let i = 0; i < workspaceIds.length; i += batchSize) {
      const batch = workspaceIds.slice(i, i + batchSize);
      const snapshot = await getDocs(
        query(collection(this.firestore, 'subscriptions'), where('workspaceId', 'in', batch)),
      );
      snapshot.docs.forEach((doc) => allSubscriptions.push(doc.data() as ISubscription));
    }
    return allSubscriptions;
  }
}
