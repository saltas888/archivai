import { ManagementClient, UsersByEmailManager } from 'auth0';

class Auth0InvitationService {
  private managementClient: ManagementClient;

  constructor() {
    // Ensure these environment variables are set in your .env file
    this.managementClient = new ManagementClient({
      domain: process.env.AUTH0_ISSUER_BASE_URL!.replace("https://", ""),
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    });
  }

  /**
   * Send an invitation to a user
   * @param email - Email of the user to invite
   * @param inviterName - Name of the person sending the invitation
   * @param roles - Optional roles to assign to the user
   * @returns Invitation details or error
   */
  async inviteUser(
    email: string, 
    inviterName: string, 
    roles?: string[]
  ) {
    try {
      const {invitationUrl, userId} = await this.createUser(email)

      // Optionally assign roles if provided
      if (roles && roles.length > 0) {
        await this.assignUserRoles(userId, roles);
      }

      return {
        invitationUrl: invitationUrl,
        userId: userId,
      };
    } catch (error) {
      console.error('Error sending Auth0 invitation:', error);
      throw new Error('Failed to send invitation');
    }
  }

  /**
   * Create a user in Auth0 if they don't exist
   * @param email - Email of the user to create
   * @returns User ID
   */
  private async createUser(email: string): Promise<{ invitationUrl: string, userId: string }> {
    try {
      // Check if user already exists
      const userByEmailResponse = await this.managementClient.usersByEmail.getByEmail({email});
      const existingUser = userByEmailResponse.data.find(user => user.email === email);
      let userId;
      if (existingUser) {
        userId = existingUser.user_id;
      } else {
          // Create new user if not exists
        const newUser = await this.managementClient.users.create({
          email,
          password: "qwerty123456!!!",
          email_verified: false,
          connection: 'Username-Password-Authentication', // Use your default connection
        });
        userId = newUser.data.user_id;
      }

      // const invitation = await this.managementClient.tickets.verifyEmail({ user_id: userId }); 
      // const invitationUrl = invitation.data.ticket;
      // Create new user if not exists
      const changePasswordResponse = await this.managementClient.tickets.changePassword({
        email,
        mark_email_as_verified: false,
        connection_id: 'con_3t6JSFwTXYZF8RmS', // Use your default connection
      });
      const invitationUrl = changePasswordResponse.data.ticket;
      // console.log("invitationUrl", invitationUrl);
      return { invitationUrl, userId };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }



  /**
   * Assign roles to a user
   * @param userId - ID of the user
   * @param roles - Array of role IDs to assign
   */
  private async assignUserRoles(userId: string, roles: string[]) {
    const roleIds = {
      'member': 'rol_veZHsP6ygmQAYeAi',
      'admin': 'rol_ynZvOixpm81Z1CKR',
    }
    const rolesToAssign = roles.map(role => roleIds[role]);
    try {
      await this.managementClient.users.assignRoles(
        { id: userId },
        { roles: rolesToAssign }
      );
    } catch (error) {
      console.error('Error assigning roles:', error);
      throw new Error('Failed to assign roles');
    }
  }

  /**
   * Delete a user by email
   * @param email - Email of the user to delete
   * @returns Boolean indicating successful deletion
   */
  async deleteUserByEmail(email: string): Promise<boolean> {
    try {
      // Find users by email
      const userByEmailResponse = await this.managementClient.usersByEmail.getByEmail({email});
      const existingUsers = userByEmailResponse.data.filter(user => user.email === email);
      // If no users found, throw an error
      if (existingUsers.length === 0) {
        throw new Error('No users found with this email');
      }

      // Delete all users with this email (in case of multiple accounts)
      await Promise.all(
        existingUsers.map(user => this.managementClient.users.delete({ id: user.user_id }))
      );

      return true;
    } catch (error) {
      console.error('Error deleting user by email:', error);
      throw new Error('Failed to delete user');
    }
  }
}

export default new Auth0InvitationService();