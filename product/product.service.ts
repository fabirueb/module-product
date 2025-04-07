import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { Invitation } from '@prisma/client';

@Injectable()
export class InvitationService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // Einladung erstellen
  async createInvitation(
    email: string,
    roleId: number,
    invitedBy: string,
  ): Promise<void> {
    const inviteToken = crypto.randomBytes(20).toString('hex'); // Zufälliger Einladungscode
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // Token läuft nach 1 Tag ab

    // Einladung in der DB speichern
    await this.prisma.invitation.create({
      data: {
        email,
        inviteToken,
        invitedBy,
        expiresAt,
        roleId,
      },
    });

    // Einladung per E-Mail versenden
    const frontend_url = process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteLink = `${frontend_url}/invitation/register?token=${inviteToken}`;
    await this.mailService.sendMail(email, 'Einladung', 'invitation', {
      invitationLink: inviteLink,
    });
  }

  async getInvitation(token: string): Promise<Invitation> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { inviteToken: token },
    });

    if (invitation && (await this.validateInvitation(token))) return invitation;
    else
      throw new NotFoundException(
        'Es konnte keine Einladung mit diesem Token gefunden werden',
      );
  }

  async getAllActiveInvitations(): Promise<Invitation[]> {
    const now = new Date();

    const invitations = await this.prisma.invitation.findMany({
      where: {
        expiresAt: {
          gt: now,
        },
        usedAt: null,
      },
    });

    return invitations;
  }

  async hasActiveInvitation(email: string): Promise<Boolean> {
    const now = new Date();
    const invitations = await this.prisma.invitation.findMany({
      where: {
        email: email,
        expiresAt: {
          gt: now,
        },
        usedAt: null,
      },
    });

    if (invitations.length > 0) return true;
    else return false;
  }

  // Einladung validieren
  async validateInvitation(token: string): Promise<boolean> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { inviteToken: token },
    });

    if (!invitation || new Date() > invitation.expiresAt || invitation.usedAt) {
      return false; // Einladung ungültig oder bereits verwendet
    }

    return true;
  }

  async markInvitationAsUsed(token: string): Promise<void> {
    await this.prisma.invitation.update({
      where: { inviteToken: token },
      data: { usedAt: new Date() },
    });
  }
}
