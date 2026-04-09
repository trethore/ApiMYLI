-- CreateTable
CREATE TABLE "blindtest_account" (
    "blindtest_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,

    CONSTRAINT "blindtest_account_pkey" PRIMARY KEY ("blindtest_id","account_id")
);

-- AddForeignKey
ALTER TABLE "blindtest_account" ADD CONSTRAINT "blindtest_account_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blindtest_account" ADD CONSTRAINT "blindtest_account_blindtest_id_fkey" FOREIGN KEY ("blindtest_id") REFERENCES "blindtest"("blindtest_id") ON DELETE RESTRICT ON UPDATE CASCADE;
