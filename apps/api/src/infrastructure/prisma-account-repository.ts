import type {
  Account as PrismaAccount,
  Artist as PrismaArtist,
  Prisma,
  PrismaClient,
} from "@prisma/generated/prisma/client";
import type { Account } from "packages/domain/src/entities/account";
import type { ArtistProfile } from "packages/domain/src/entities/artist-profile";
import type {
  AccountRepository,
  CreateAccountData,
  UpdateAccountData,
  UpdateArtistProfileData,
} from "packages/domain/src/repositories/account-repository";

type PrismaAccountWithArtist = PrismaAccount & {
  artist?: PrismaArtist | null;
};

const toNullableNumber = (value: bigint | number | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
};

const toArtistProfile = (artist: PrismaArtist): ArtistProfile => ({
  artistId: artist.artistId,
  artistBio: artist.artistBio,
  artistLocation: artist.artistLocation,
  artistLatitude: artist.artistLatitude,
  artistLongitude: artist.artistLongitude,
  artistActiveYearBegin: artist.artistActiveYearBegin,
  artistActiveYearEnd: artist.artistActiveYearEnd,
  artistFavorites: toNullableNumber(artist.artistFavorites),
  artistComments: toNullableNumber(artist.artistComments),
});

const toAccount = (account: PrismaAccountWithArtist): Account => ({
  accountId: account.accountId,
  login: account.login,
  password: account.password,
  name: account.name,
  email: account.email,
  isArtist: account.isArtist,
  artist: account.artist ? toArtistProfile(account.artist) : null,
  createdAt: account.createdAt,
});

const toArtistUpdateInput = (data: UpdateArtistProfileData): Prisma.ArtistUpdateInput => {
  const updateInput: Prisma.ArtistUpdateInput = {};

  if (data.artistBio !== undefined) {
    updateInput.artistBio = data.artistBio;
  }

  if (data.artistLocation !== undefined) {
    updateInput.artistLocation = data.artistLocation;
  }

  if (data.artistLatitude !== undefined) {
    updateInput.artistLatitude = data.artistLatitude;
  }

  if (data.artistLongitude !== undefined) {
    updateInput.artistLongitude = data.artistLongitude;
  }

  if (data.artistActiveYearBegin !== undefined) {
    updateInput.artistActiveYearBegin = data.artistActiveYearBegin;
  }

  if (data.artistActiveYearEnd !== undefined) {
    updateInput.artistActiveYearEnd = data.artistActiveYearEnd;
  }

  if (data.artistFavorites !== undefined) {
    updateInput.artistFavorites = data.artistFavorites;
  }

  if (data.artistComments !== undefined) {
    updateInput.artistComments = data.artistComments;
  }

  return updateInput;
};

const toArtistCreateInput = (
  id: string,
  data: UpdateArtistProfileData,
): Prisma.ArtistCreateInput => {
  const createInput: Prisma.ArtistCreateInput = {
    account: {
      connect: {
        accountId: id,
      },
    },
  };

  if (data.artistBio !== undefined) {
    createInput.artistBio = data.artistBio;
  }

  if (data.artistLocation !== undefined) {
    createInput.artistLocation = data.artistLocation;
  }

  if (data.artistLatitude !== undefined) {
    createInput.artistLatitude = data.artistLatitude;
  }

  if (data.artistLongitude !== undefined) {
    createInput.artistLongitude = data.artistLongitude;
  }

  if (data.artistActiveYearBegin !== undefined) {
    createInput.artistActiveYearBegin = data.artistActiveYearBegin;
  }

  if (data.artistActiveYearEnd !== undefined) {
    createInput.artistActiveYearEnd = data.artistActiveYearEnd;
  }

  if (data.artistFavorites !== undefined) {
    createInput.artistFavorites = data.artistFavorites;
  }

  if (data.artistComments !== undefined) {
    createInput.artistComments = data.artistComments;
  }

  return createInput;
};

export const createPrismaAccountRepository = (prisma: PrismaClient): AccountRepository => ({
  create: async (data: CreateAccountData): Promise<Account> => {
    const account = await prisma.account.create({
      data: {
        login: data.login,
        email: data.email,
        password: data.password,
        name: data.name,
        isArtist: data.isArtist,
        user: {
          create: {
            pseudo: data.login,
          },
        },
        artist: data.isArtist ? { create: {} } : undefined,
      },
      include: { artist: true },
    });

    return toAccount(account);
  },
  findById: async (id: string): Promise<Account | null> => {
    const account = await prisma.account.findUnique({
      where: { accountId: id },
      include: { artist: true },
    });

    return account ? toAccount(account) : null;
  },
  findByLogin: async (login: string): Promise<Account | null> => {
    const account = await prisma.account.findUnique({
      where: { login },
      include: { artist: true },
    });

    return account ? toAccount(account) : null;
  },
  findByEmail: async (email: string): Promise<Account | null> => {
    const account = await prisma.account.findUnique({
      where: { email },
      include: { artist: true },
    });

    return account ? toAccount(account) : null;
  },
  update: async (id: string, data: UpdateAccountData): Promise<Account | null> => {
    const existingAccount = await prisma.account.findUnique({ where: { accountId: id } });
    if (!existingAccount) {
      return null;
    }

    const accountUpdateInput: Prisma.AccountUpdateInput = {};
    if (data.login !== undefined) {
      accountUpdateInput.login = data.login;
    }

    if (data.email !== undefined) {
      accountUpdateInput.email = data.email;
    }

    if (data.password !== undefined) {
      accountUpdateInput.password = data.password;
    }

    if (data.name !== undefined) {
      accountUpdateInput.name = data.name;
    }

    if (data.isArtist !== undefined) {
      accountUpdateInput.isArtist = data.isArtist;
    }

    const account = await prisma.$transaction(
      async (transaction): Promise<PrismaAccountWithArtist | null> => {
        await transaction.account.update({
          where: { accountId: id },
          data: accountUpdateInput,
        });

        if (data.isArtist === true) {
          await transaction.artist.upsert({
            where: { artistId: id },
            update: {},
            create: {
              account: {
                connect: {
                  accountId: id,
                },
              },
            },
          });
        }

        if (data.isArtist === false) {
          await transaction.artist.deleteMany({ where: { artistId: id } });
        }

        return transaction.account.findUnique({
          where: { accountId: id },
          include: { artist: true },
        });
      },
    );

    return account ? toAccount(account) : null;
  },
  updateArtistProfile: async (
    id: string,
    data: UpdateArtistProfileData,
  ): Promise<ArtistProfile | null> => {
    const updateInput = toArtistUpdateInput(data);
    const createInput = toArtistCreateInput(id, data);

    const artist = await prisma.artist.upsert({
      where: { artistId: id },
      create: createInput,
      update: updateInput,
    });

    return toArtistProfile(artist);
  },
  delete: async (id: string): Promise<boolean> => {
    try {
      const deletedCount = await prisma.$transaction(async (transaction): Promise<number> => {
        await transaction.trackUserLike.deleteMany({ where: { accountId: id } });
        await transaction.trackUserListen.deleteMany({ where: { accountId: id } });
        await transaction.trackComment.deleteMany({ where: { accountId: id } });
        await transaction.userPinnedItem.deleteMany({ where: { accountId: id } });
        await transaction.genrePreference.deleteMany({ where: { accountId: id } });
        await transaction.preferenceVector.deleteMany({ where: { accountId: id } });
        await transaction.preference.deleteMany({ where: { accountId: id } });
        await transaction.playlistUser.deleteMany({ where: { accountId: id } });
        await transaction.user.deleteMany({ where: { accountId: id } });
        await transaction.artist.deleteMany({ where: { artistId: id } });
        const result = await transaction.account.deleteMany({ where: { accountId: id } });
        return result.count;
      });

      return deletedCount > 0;
    } catch {
      return false;
    }
  },
  list: async (): Promise<Account[]> => {
    const accounts = await prisma.account.findMany({
      include: { artist: true },
    });

    return accounts.map((account: PrismaAccountWithArtist) => toAccount(account));
  },
});
