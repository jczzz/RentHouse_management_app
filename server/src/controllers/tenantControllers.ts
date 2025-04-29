import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";

const prisma = new PrismaClient();

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  // 这里的代码不是一个很好的clean architecture,it's typically recommended to keep controllers focused on handling HTTP requests 
  // and delegate business logic to services or use cases
  // 在 Clean Architecture（干净架构） 中，Controller 主要负责处理 HTTP 请求和响应，而不应该包含业务逻辑。业务逻辑应该放在 Service 或 Use Case 层
  try {
    const { cognitoId } = req.params;
    
    /**
     比如: 
    🚀controllers/tenantController.js只处理请求与响应，不包含业务逻辑
    const tenantService = require('../services/tenantService');
    const SearchTenant = async (req, res) => {
      try {
        const cognitoId = req.body.cognitoId;
        const tenant = await tenantService.getUniqueTenant(cognitoId);
        res.status(201).json({ user: tenant });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    };
    module.exports = { SearchTenant };

    🚀services/tenantService.js 处理业务逻辑，调用数据库仓储层（repository）
    const tenantRepository = require('../repositories/tenantRepository');
    const getUniqueTenant = async (cognitoId) => {
      const existingTenant = await tenantRepository.findByCognitoId(cognitoId);
      if (!existingUser) {
        throw new Error('User no exists');
      }
      return existingUser;
    };
    module.exports = { getUniqueTenant };


    🚀repositories/tenantRepository.js 只处理数据库相关的操作
    const Tenant = require('../models/tenantModel');
    const findByCognitoId = async (cognitoId) => {
      return await Tenant.findOne({ cognitoId });
    };
    module.exports = { findByCognitoId };

    🚀models/tenantModel.js（以 Mongoose 为ODM）
    const mongoose = require('mongoose');
    const tenantSchema = new mongoose.Schema({
      email: String,
      password: String,
      cognitoId: String
    });
    module.exports = mongoose.model('Tenant', tenantSchema);
     */
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    });

    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).json({ message: "Tenant not found" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving tenant: ${error.message}` });
  }
};

export const createTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    const tenant = await prisma.tenant.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(tenant);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating tenant: ${error.message}` });
  }
};

export const updateTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const { name, email, phoneNumber } = req.body;

    const updateTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.json(updateTenant);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating tenant: ${error.message}` });
  }
};

export const getCurrentResidences = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const properties = await prisma.property.findMany({
      where: { tenants: { some: { cognitoId } } },
      include: {
        location: true,
      },
    });

    const residencesWithFormattedLocation = await Promise.all(
      properties.map(async (property) => {
        const coordinates: { coordinates: string }[] =
          await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

        const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
        const longitude = geoJSON.coordinates[0];
        const latitude = geoJSON.coordinates[1];

        return {
          ...property,
          location: {
            ...property.location,
            coordinates: {
              longitude,
              latitude,
            },
          },
        };
      })
    );

    res.json(residencesWithFormattedLocation);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving manager properties: ${err.message}` });
  }
};

export const addFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, propertyId } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: { favorites: true },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    const propertyIdNumber = Number(propertyId);
    const existingFavorites = tenant.favorites || [];

    if (!existingFavorites.some((fav) => fav.id === propertyIdNumber)) {
      const updatedTenant = await prisma.tenant.update({
        where: { cognitoId },
        data: {
          favorites: {
            connect: { id: propertyIdNumber },
          },
        },
        include: { favorites: true },
      });
      res.json(updatedTenant);
    } else {
      res.status(409).json({ message: "Property already added as favorite" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error adding favorite property: ${error.message}` });
  }
};

export const removeFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, propertyId } = req.params;
    const propertyIdNumber = Number(propertyId);

    const updatedTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        favorites: {
          disconnect: { id: propertyIdNumber },
        },
      },
      include: { favorites: true },
    });

    res.json(updatedTenant);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error removing favorite property: ${err.message}` });
  }
};
