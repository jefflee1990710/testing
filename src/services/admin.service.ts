import { AdminUser } from '@/src/models/admin-user';
import { AdminDao } from '@/src/dao/admin.dao';
import bcrypt from 'bcryptjs';

/**
 * Service for handling admin-related operations.
 * This service provides methods for managing admin users, including retrieval, creation, and updates.
 */
export class AdminService {
  /**
   * Retrieves a paginated list of admin users from the database.
   * 
   * @param {number} page - The page number to retrieve (starts from 1).
   * @param {number} limit - The number of admins to retrieve per page.
   * @returns {Promise<{ admins: AdminUser[]; total: number; pages: number }>} A promise that resolves to an object containing the admins, total count, and total pages.
   */
  static async getAdmins(page: number = 1, limit: number = 10): Promise<{ admins: AdminUser[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    // Fetch admins and total count in parallel using DAO
    const [admins, total] = await Promise.all([
      AdminDao.findMany({}, skip, limit),
      AdminDao.count({})
    ]);

    const pages = Math.ceil(total / limit);

    console.log(`[AdminService] Fetched ${admins.length} admins (Page ${page}/${pages}, Total: ${total})`);

    return {
      admins: admins as AdminUser[],
      total,
      pages
    };
  }

  /**
   * Creates a new admin user in the database.
   * 
   * @param {Partial<AdminUser> & { password?: string }} adminData - The admin data to create.
   * @returns {Promise<string>} A promise that resolves to the created admin's ID.
   * @throws {Error} If the admin already exists or creation fails.
   */
  static async createAdmin(adminData: Partial<AdminUser> & { password?: string }): Promise<string> {
    // Check if admin already exists using DAO
    const existingAdmin = await AdminDao.findByEmail(adminData.email!);
    if (existingAdmin) {
      throw new Error('An admin with this email already exists');
    }

    // Default values
    const newAdmin: any = {
      ...adminData,
      permissions: adminData.permissions || ['all'],
      isActive: adminData.isActive !== undefined ? adminData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Hash password
    const password = adminData.password || Math.random().toString(36).slice(-12);
    newAdmin.password = await bcrypt.hash(password, 10);

    // Insert admin using DAO
    const result = await AdminDao.insertOne(newAdmin as AdminUser);
    
    console.log(`[AdminService] Created new admin with email: ${adminData.email}, ID: ${result.insertedId}`);
    return result.insertedId.toString();
  }

  /**
   * Updates an existing admin's information.
   * 
   * @param {string} adminId - The ID of the admin to update.
   * @param {Partial<AdminUser>} data - The data to update.
   * @returns {Promise<boolean>} A promise that resolves to true if the update was successful.
   */
  static async updateAdmin(adminId: string, data: Partial<AdminUser>): Promise<boolean> {
    // If password is provided, hash it
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Update admin using DAO
    const success = await AdminDao.updateById(adminId, { $set: updateData });

    console.log(`[AdminService] Updated admin ${adminId}:`, success);
    return success;
  }

  /**
   * Deletes an admin from the database.
   * 
   * @param {string} adminId - The ID of the admin to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if the deletion was successful.
   */
  static async deleteAdmin(adminId: string): Promise<boolean> {
    // Delete admin using DAO
    const success = await AdminDao.deleteById(adminId);

    console.log(`[AdminService] Deleted admin ${adminId}:`, success);
    return success;
  }
}

